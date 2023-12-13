# app/models.py
from app import db
from datetime import date
from sqlalchemy.dialects.mysql import JSON

class Coaches(db.Model):
    coach_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    #gender = db.Column(db.String(1), nullable=False, check_constraint="gender IN ('M', 'F')")
    password = db.Column(db.String(60), nullable=False)
    phone = db.Column(db.String(255), unique=True)
    sports = db.Column(db.String(255))
    institute = db.Column(db.String(255))

class Admin(db.Model):
    admin_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)


class Athletes(db.Model):
    athlete_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(255), unique=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    age = db.Column(db.Integer)
    sports = db.Column(db.String(255))
    gender = db.Column(db.String(30), nullable=False, check_constraint="gender IN ('male', 'female', 'other')")
    institute = db.Column(db.String(255))
    password = db.Column(db.String(60), nullable=False)
    

class Teams(db.Model):
    __tablename__ = 'teams'
    team_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    sport = db.Column(db.String(255), nullable=False)
    # institute = db.Column(db.String(255))
    coach_id = db.Column(db.Integer, db.ForeignKey('coaches.coach_id'))

class TeamMemberships(db.Model):
    __tablename__ = 'team_memberships'
    membership_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    athlete_id = db.Column(db.Integer, db.ForeignKey('athletes.athlete_id'))
    team_id = db.Column(db.Integer, db.ForeignKey('teams.team_id'))

class Workouts(db.Model):
    __tablename__ = 'workouts'
    workout_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    coach_id = db.Column(db.Integer, db.ForeignKey('coaches.coach_id'), nullable=False)
    # Define a relationship with Coach (assuming you have a Coach model)
    coach = db.relationship('Coaches', backref=db.backref('workouts', lazy=True))
    date_added = db.Column(db.Date, default=date.today())
    
class Blocks(db.Model):
    __tablename__ = 'blocks'
    block_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    workout_id = db.Column(db.Integer, db.ForeignKey('workouts.workout_id'), nullable=False)
    workout = db.relationship('Workouts', backref=db.backref('blocks', lazy=True))

class Exercises(db.Model):
    __tablename__ = 'exercises'
    exercise_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    block_id = db.Column(db.Integer, db.ForeignKey('blocks.block_id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    loads_reps = db.Column(JSON) 
    sets = db.Column(db.Integer)
    block = db.relationship('Blocks', backref=db.backref('exercises', lazy=True))

class Notes(db.Model):
    note_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    coach_id = db.Column(db.Integer, db.ForeignKey('coaches.coach_id'), nullable=False)
    athlete_id = db.Column(db.Integer, db.ForeignKey('athletes.athlete_id'), nullable=False)
    date_created = db.Column(db.Date, nullable=False)
    subject = db.Column(db.String(1000), nullable=False)
    athlete_reply = db.Column(db.String(1000), nullable=True)
    coach_reply = db.Column(db.String(1000), nullable=True)

class TeamWorkoutsAssignments(db.Model):
    __tablename__ = 'team_workouts_assignments'
    assignment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.team_id'), nullable=False)
    workout_id = db.Column(db.Integer, db.ForeignKey('workouts.workout_id'), nullable=False)

class AthleteWorkouts(db.Model):
    __tablename__ = 'athlete_workouts'
    athlete_workout_id = db.Column(db.Integer, primary_key=True, autoincrement=True)  
    athlete_id = db.Column(db.Integer, db.ForeignKey('athletes.athlete_id'), nullable=False)
    workout_id = db.Column(db.Integer, db.ForeignKey('workouts.workout_id'), nullable=False)
    athlete = db.relationship('Athletes', backref=db.backref('workout_assignments', lazy=True))
    workout = db.relationship('Workouts', backref=db.backref('assigned_athletes', lazy=True))
    date_completed = db.Column(db.Date)


class CoachAthleteMembership(db.Model):
    __tablename__ = 'coach_athlete_memberships'
    coach_athlete_membership_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    coach_id = db.Column(db.Integer, db.ForeignKey('coaches.coach_id'))
    athlete_id = db.Column(db.Integer, db.ForeignKey('athletes.athlete_id'))

class AthleteExerciseInputLoads(db.Model):
    __tablename__ = 'athlete_exercise_input_loads'
    load_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    input_load = db.Column(JSON)   # Use an appropriate data type for input loads
    athlete_id = db.Column(db.Integer, db.ForeignKey('athletes.athlete_id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.exercise_id'), nullable=False)
    exercise_completed_date = db.Column(db.Date)
    athlete = db.relationship('Athletes', backref=db.backref('exercise_input_loads', lazy=True))
    exercise = db.relationship('Exercises', backref=db.backref('athlete_input_loads', lazy=True))

# Classes for defining new exercises

class Category(db.Model):
    __tablename__ = 'category'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class ExerciseType(db.Model):
    __tablename__ = 'exercise_type'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    category = db.relationship('Category', backref='exercise_types')

class DefineExercise(db.Model):
    __tablename__ = 'define_exercise'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type_id = db.Column(db.Integer, db.ForeignKey('exercise_type.id'))
    exercise_type = db.relationship('ExerciseType', backref='exercises')

class Sports(db.Model):
    __tablename__ = 'sports'
    sport_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=True)


class Institutes(db.Model):
    __tablename__ = 'institutes'
    institute_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=True)

class AdminCoachNotifications(db.Model):
    __tablename__ = 'admin_coach_notifications'
    notification_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    sports = db.Column(db.String(255))
    institute = db.Column(db.String(255))
    date_created = db.Column(db.Date, nullable=False)
    flag = db.Column(db.String(10), default="unopened")

class AdminAthleteNotifications(db.Model):
    __tablename__ = 'admin_athlete_notifications'
    notification_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    sports = db.Column(db.String(255))  # Assuming each athlete is associated with one sport
    institute = db.Column(db.String(255))
    date_created = db.Column(db.Date, nullable=False)
    flag = db.Column(db.String(10), default="unopened")
    # Additional fields specific to athletes can be added here



class CoachDefinedExercisesRelationship(db.Model):
    __tablename__ = 'coach_defined_exercises_relationship'
    id = db.Column(db.Integer, primary_key=True)
    coach_id = db.Column(db.Integer, db.ForeignKey('coaches.coach_id'))
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))

    coach = db.relationship('Coaches', backref='coach_defined_exercises_relationship')
    category = db.relationship('Category', backref='coach_defined_exercises_relationship')


class CoachNotification(db.Model):
    __tablename__ = 'coachnotifications'
    notification_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    coach_id = db.Column(db.Integer, nullable=False)
    athlete_id = db.Column(db.Integer, nullable=True)  # Added athlete_id, nullable since it might not always be relevant
    workout_id = db.Column(db.Integer, nullable=False)  # Replacing content with workout_id
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(10), default="unopened")

class AthleteNotification(db.Model):
    __tablename__ = 'athletenotifications'
    notification_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    athlete_id = db.Column(db.Integer, nullable=False)
    coach_id = db.Column(db.Integer, nullable=True)  # Still nullable, as the coach might not always be relevant
    workout_name = db.Column(db.String(100), nullable=False)  # Now referencing workout by name
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(10), default="unopened")



### Tests Tables ###

class TestsWorkouts(db.Model):
    __tablename__ = 'tests_workouts'
    test_workout_id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    coach_id = db.Column(db.Integer, db.ForeignKey('coaches.coach_id'), nullable=False)
    # Define a relationship with Coach (assuming you have a Coach model)
    coach = db.relationship('Coaches', backref=db.backref('tests_workouts', lazy=True))
    date_added = db.Column(db.Date, default=date.today())
    
class TestsBlocks(db.Model):
    __tablename__ = 'tests_blocks'
    test_block_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    test_workout_id = db.Column(db.Integer, db.ForeignKey('tests_workouts.test_workout_id'), nullable=False)
    test_workout = db.relationship('TestsWorkouts', backref=db.backref('tests_blocks', lazy=True))

class TestsExercises(db.Model):
    __tablename__ = 'tests_exercises'
    test_exercise_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    test_block_id = db.Column(db.Integer, db.ForeignKey('tests_blocks.test_block_id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    loads_reps = db.Column(JSON) 
    sets = db.Column(db.Integer)
    test_block = db.relationship('TestsBlocks', backref=db.backref('tests_exercises', lazy=True))



class TestsTeamWorkoutsAssignments(db.Model):
    __tablename__ = 'tests_team_workouts_assignments'
    test_assignment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.team_id'), nullable=False)
    test_workout_id = db.Column(db.Integer, db.ForeignKey('tests_workouts.test_workout_id'), nullable=False)

class TestsAthleteWorkouts(db.Model):
    __tablename__ = 'tests_athlete_workouts'
    test_athlete_workout_id = db.Column(db.Integer, primary_key=True, autoincrement=True)  
    athlete_id = db.Column(db.Integer, db.ForeignKey('athletes.athlete_id'), nullable=False)
    test_workout_id = db.Column(db.Integer, db.ForeignKey('tests_workouts.test_workout_id'), nullable=False)
    athlete = db.relationship('Athletes', backref=db.backref('test_workout_assignments', lazy=True))
    testsworkout = db.relationship('TestsWorkouts', backref=db.backref('test_assigned_athletes', lazy=True))
    date_completed = db.Column(db.Date)

    
class TestsAthleteExerciseInputLoads(db.Model):
    __tablename__ = 'tests_athlete_exercise_input_loads'
    test_load_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    input_load = db.Column(JSON)   # Use an appropriate data type for input loads
    athlete_id = db.Column(db.Integer, db.ForeignKey('athletes.athlete_id'), nullable=False)
    test_exercise_id = db.Column(db.Integer, db.ForeignKey('tests_exercises.test_exercise_id'), nullable=False)
    exercise_completed_date = db.Column(db.Date)
    athlete = db.relationship('Athletes', backref=db.backref('tests_athlete_exercise_input_loads', lazy=True))
    tests_exercise = db.relationship('TestsExercises', backref=db.backref('tests_athlete_input_loads', lazy=True))