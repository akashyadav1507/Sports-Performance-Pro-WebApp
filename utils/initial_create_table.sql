CREATE TABLE IF NOT EXISTS admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS coaches (
    coach_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'F'))
);

CREATE TABLE IF NOT EXISTS athletes (
    athlete_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    coach_id INT NOT NULL,
    FOREIGN KEY (coach_id) REFERENCES coaches (coach_id),
    UNIQUE (name, coach_id)
);

CREATE TABLE IF NOT EXISTS teams (
   team_id INT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(255) NOT NULL,
   sport VARCHAR(255) NOT NULL,
   coach_id INT,
   FOREIGN KEY (coach_id) REFERENCES coaches (coach_id)
);

CREATE TABLE IF NOT EXISTS team_memberships (
    membership_id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    team_id INT NOT NULL,
    FOREIGN KEY (athlete_id) REFERENCES athletes (athlete_id),
    FOREIGN KEY (team_id) REFERENCES teams (team_id)
);

/*--------------------workouts-----------------------*/

CREATE TABLE IF NOT EXISTS workouts (
    workout_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    coach_id INT NOT NULL,
    FOREIGN KEY (coach_id) REFERENCES coaches (coach_id)
);

CREATE TABLE IF NOT EXISTS blocks (
    block_id INT AUTO_INCREMENT PRIMARY KEY,
    workout_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (workout_id) REFERENCES workouts (workout_id)
);

CREATE TABLE IF NOT EXISTS exercises (
    exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    block_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    loads VARCHAR(255),
    reps INT,
    sets INT,
    FOREIGN KEY (block_id) REFERENCES blocks (block_id)
);

CREATE TABLE IF NOT EXISTS workout_exercise (
    workout_id INT AUTO_INCREMENT NOT NULL,
    exercise_id INT NOT NULL,
    PRIMARY KEY (workout_id, exercise_id),
    FOREIGN KEY (workout_id) REFERENCES workouts (workout_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises (exercise_id)
);

/*--------------------athlete workout input-----------------------*/

CREATE TABLE IF NOT EXISTS athlete_workouts (
    athlete_workout_id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    workout_id INT NOT NULL,
    date_completed DATE NOT NULL,
    FOREIGN KEY (athlete_id) REFERENCES athletes (athlete_id),
    FOREIGN KEY (workout_id) REFERENCES workouts (workout_id)
);

CREATE TABLE IF NOT EXISTS athlete_blocks (
    athlete_block_id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_workout_id INT NOT NULL,
    block_id INT NOT NULL,
    FOREIGN KEY (athlete_workout_id) REFERENCES athlete_workouts (athlete_workout_id),
    FOREIGN KEY (block_id) REFERENCES blocks (block_id)
);

CREATE TABLE IF NOT EXISTS athlete_exercises (
    athlete_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_block_id INT NOT NULL,
    exercise_id INT NOT NULL,
    loads VARCHAR(255),
    reps_completed INT,
    sets_completed INT,
    FOREIGN KEY (athlete_block_id) REFERENCES athlete_blocks (athlete_block_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises (exercise_id)
);

/*--------------------tests-----------------------*/

CREATE TABLE IF NOT EXISTS tests (
    test_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    coach_id INT NOT NULL,
    FOREIGN KEY (coach_id) REFERENCES coaches (coach_id)
);

CREATE TABLE IF NOT EXISTS test_blocks (
    test_block_id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (test_id) REFERENCES tests (test_id)
);

CREATE TABLE IF NOT EXISTS test_exercises (
    test_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    test_block_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    loads VARCHAR(255),
    reps INT,
    sets INT,
    FOREIGN KEY (test_block_id) REFERENCES test_blocks (test_block_id)
);

CREATE TABLE IF NOT EXISTS test_exercise_association (
    test_id INT AUTO_INCREMENT NOT NULL,
    test_exercise_id INT NOT NULL,
    PRIMARY KEY (test_id, test_exercise_id),
    FOREIGN KEY (test_id) REFERENCES tests (test_id),
    FOREIGN KEY (test_exercise_id) REFERENCES test_exercises (test_exercise_id)
);


/*--------------------athlete test input-----------------------*/

CREATE TABLE IF NOT EXISTS athlete_tests (
    athlete_test_id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    test_id INT NOT NULL,
    date_completed DATE NOT NULL,
    FOREIGN KEY (athlete_id) REFERENCES athletes (athlete_id),
    FOREIGN KEY (test_id) REFERENCES tests (test_id)
);

CREATE TABLE IF NOT EXISTS athlete_test_blocks (
    athlete_test_block_id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_test_id INT NOT NULL,
    test_block_id INT NOT NULL,
    FOREIGN KEY (athlete_test_id) REFERENCES athlete_tests (athlete_test_id),
    FOREIGN KEY (test_block_id) REFERENCES test_blocks (test_block_id)
);

CREATE TABLE IF NOT EXISTS athlete_test_exercises (
    athlete_test_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_test_block_id INT NOT NULL,
    test_exercise_id INT NOT NULL,
    loads VARCHAR(255),
    reps_completed INT,
    sets_completed INT,
    FOREIGN KEY (athlete_test_block_id) REFERENCES athlete_test_blocks (athlete_test_block_id),
    FOREIGN KEY (test_exercise_id) REFERENCES test_exercises (test_exercise_id)
);

/*------------------team workout-----------------------*/

CREATE TABLE IF NOT EXISTS team_workouts_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    workout_id INT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams (team_id),
    FOREIGN KEY (workout_id) REFERENCES workouts (workout_id)
);

CREATE TABLE IF NOT EXISTS team_blocks_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    block_id INT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams (team_id),
    FOREIGN KEY (block_id) REFERENCES blocks (block_id)
);

CREATE TABLE IF NOT EXISTS team_exercises_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    exercise_id INT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams (team_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises (exercise_id)
);

CREATE TABLE IF NOT EXISTS team_athlete_workouts_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    athlete_workout_id INT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams (team_id),
    FOREIGN KEY (athlete_workout_id) REFERENCES athlete_workouts (athlete_workout_id)
);
/*Assigning specific athlete workout to teams*/

/*--------------------Team tests-----------------------*/

CREATE TABLE IF NOT EXISTS team_tests_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    test_id INT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams (team_id),
    FOREIGN KEY (test_id) REFERENCES tests (test_id)
);

CREATE TABLE IF NOT EXISTS team_test_blocks_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    test_block_id INT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams (team_id),
    FOREIGN KEY (test_block_id) REFERENCES test_blocks (test_block_id)
);

CREATE TABLE IF NOT EXISTS team_test_exercise_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    test_exercise_id INT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams (team_id),
    FOREIGN KEY (test_exercise_id) REFERENCES test_exercises (test_exercise_id)
);

CREATE TABLE IF NOT EXISTS team_athlete_tests_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    athlete_test_id INT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams (team_id),
    FOREIGN KEY (athlete_test_id) REFERENCES athlete_tests (athlete_test_id)
);

/*--------------------notes-----------------------*/

CREATE TABLE IF NOT EXISTS notes (
    note_id INT AUTO_INCREMENT PRIMARY KEY,
    coach_id INT NOT NULL,
    athlete_id INT NOT NULL,
    date_created DATE NOT NULL,
    content TEXT NOT NULL,
    FOREIGN KEY (coach_id) REFERENCES coaches (coach_id),
    FOREIGN KEY (athlete_id) REFERENCES athletes (athlete_id)
);
