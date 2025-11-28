// Interviews Controller

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/interviews
 * Get all interviews with respondent data
 */
export const getInterviews = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        respondent: {
          select: {
            id: true,
            name: true,
            role: true,
            division: true
          }
        },
        interviewer: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        _count: {
          select: {
            interviewQA: true
          }
        }
      },
      orderBy: {
        interviewDate: 'desc'
      }
    });

    res.json({
      interviews,
      total: interviews.length
    });

  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch interviews'
    });
  }
};

/**
 * GET /api/interviews/:id
 * Get single interview with full details
 */
export const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await prisma.interview.findUnique({
      where: { id: parseInt(id) },
      include: {
        respondent: true,
        interviewer: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        interviewQA: {
          include: {
            question: true,
            interviewQAControls: {
              include: {
                control: {
                  select: {
                    id: true,
                    controlTitle: true,
                    controlCategory: true
                  }
                }
              }
            }
          },
          orderBy: {
            questionOrder: 'asc'
          }
        }
      }
    });

    if (!interview) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Interview not found'
      });
    }

    res.json({ interview });

  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch interview'
    });
  }
};

/**
 * POST /api/interviews
 * Create new interview
 */
export const createInterview = async (req, res) => {
  try {
    const { respondentId, newRespondent, interviewDate, questions } = req.body;

    // Validation
    if (!interviewDate) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Interview date is required'
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'At least one question is required'
      });
    }

    // Validate respondent data
    if (!respondentId && !newRespondent) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Either respondentId or newRespondent data is required'
      });
    }

    if (newRespondent) {
      if (!newRespondent.name || !newRespondent.role) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Respondent name and role are required'
        });
      }
    }

    // Validate questions
    for (const q of questions) {
      if (!q.questionText || q.questionText.trim() === '') {
        return res.status(400).json({
          error: 'Validation error',
          message: 'All questions must have text'
        });
      }
    }

    // Use transaction to create all records atomically
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create or get respondent
      let finalRespondentId = respondentId;

      if (!respondentId && newRespondent) {
        const createdRespondent = await tx.respondent.create({
          data: {
            name: newRespondent.name,
            role: newRespondent.role,
            division: newRespondent.division || null,
            email: newRespondent.email || null,
            phone: newRespondent.phone || null,
            notes: newRespondent.notes || null
          }
        });
        finalRespondentId = createdRespondent.id;
      } else if (respondentId) {
        // Verify respondent exists
        const existingRespondent = await tx.respondent.findUnique({
          where: { id: respondentId }
        });
        if (!existingRespondent) {
          throw new Error('RESPONDENT_NOT_FOUND');
        }
      }

      // Step 2: Create interview
      const interview = await tx.interview.create({
        data: {
          respondentId: finalRespondentId,
          interviewDate: new Date(interviewDate),
          interviewerId: req.user?.id || null,
          status: 'scheduled'
        }
      });

      // Step 3: Create interview questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        // Verify questionId exists if provided
        if (q.questionId) {
          const existingQuestion = await tx.question.findUnique({
            where: { id: q.questionId }
          });
          if (!existingQuestion) {
            throw new Error(`QUESTION_NOT_FOUND: ${q.questionId}`);
          }
        }

        // Create InterviewQA record
        const interviewQA = await tx.interviewQA.create({
          data: {
            interviewId: interview.id,
            questionId: q.questionId || null,
            questionText: q.questionText.trim(),
            answerText: null, // Will be filled later
            questionOrder: i + 1
          }
        });

        // Step 4: Create control mappings if provided
        if (q.controls && Array.isArray(q.controls) && q.controls.length > 0) {
          for (const controlId of q.controls) {
            // Verify control exists
            const existingControl = await tx.annexAControl.findUnique({
              where: { id: controlId }
            });
            if (!existingControl) {
              throw new Error(`CONTROL_NOT_FOUND: ${controlId}`);
            }

            await tx.interviewQAControl.create({
              data: {
                qaId: interviewQA.id,
                controlId: controlId
              }
            });
          }
        }
      }

      // Step 5: Log activity
      await tx.activity.create({
        data: {
          userId: req.user?.id || 1, // Default to admin if no user
          activityType: 'interview_created',
          entityType: 'interviews',
          entityId: interview.id,
          description: `Created interview with ${newRespondent?.name || 'respondent'}`
        }
      });

      // Fetch complete interview data to return
      const completeInterview = await tx.interview.findUnique({
        where: { id: interview.id },
        include: {
          respondent: true,
          interviewer: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          interviewQA: {
            include: {
              question: true,
              interviewQAControls: {
                include: {
                  control: {
                    select: {
                      id: true,
                      controlTitle: true,
                      controlCategory: true
                    }
                  }
                }
              }
            },
            orderBy: {
              questionOrder: 'asc'
            }
          }
        }
      });

      return completeInterview;
    });

    res.status(201).json({
      message: 'Interview created successfully',
      interview: result
    });

  } catch (error) {
    console.error('Create interview error:', error);

    // Handle specific errors
    if (error.message === 'RESPONDENT_NOT_FOUND') {
      return res.status(404).json({
        error: 'Not found',
        message: 'Respondent not found'
      });
    }

    if (error.message?.startsWith('QUESTION_NOT_FOUND')) {
      return res.status(404).json({
        error: 'Not found',
        message: error.message.replace('QUESTION_NOT_FOUND: ', 'Question not found: ')
      });
    }

    if (error.message?.startsWith('CONTROL_NOT_FOUND')) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message.replace('CONTROL_NOT_FOUND: ', 'Control not found: ')
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create interview'
    });
  }
};

/**
 * GET /api/respondents
 * Get all respondents for selection dropdown
 */
export const getRespondents = async (req, res) => {
  try {
    const respondents = await prisma.respondent.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        division: true,
        email: true,
        phone: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      respondents,
      total: respondents.length
    });

  } catch (error) {
    console.error('Get respondents error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch respondents'
    });
  }
};

/**
 * GET /api/questions
 * Get all questions from question bank
 */
export const getQuestionBank = async (req, res) => {
  try {
    const { category } = req.query;

    const where = {};

    if (category) {
      where.questionCategory = category;
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      questions,
      total: questions.length
    });

  } catch (error) {
    console.error('Get question bank error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch question bank'
    });
  }
};
