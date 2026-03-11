Feature: Learner completion journey
  Scenario: Learner receives adaptive recommendations after a quiz
    Given the learner has completed at least 3 quizzes
    And the learner has weak mastery in linear equations
    When the learner opens the recommendation feed
    Then the system should suggest a linear equations remediation plan
    And a timed quiz for reinforcement
