# app/routes.py
from mysqlx import IntegrityError
from app import app,db
from app.models import Coaches, CoachAthleteMembership, Athletes, Teams, TeamMemberships, Workouts, Blocks, Exercises, Notes, AthleteWorkouts, TeamWorkoutsAssignments, Category, ExerciseType, AthleteExerciseInputLoads, DefineExercise, Sports, Institutes, AdminCoachNotifications, AdminAthleteNotifications, AthleteNotification, CoachNotification, CoachDefinedExercisesRelationship , TestsWorkouts,TestsBlocks,TestsExercises,TestsTeamWorkoutsAssignments,TestsAthleteWorkouts,TestsAthleteExerciseInputLoads


from flask import jsonify,request, Flask, render_template, request, redirect, url_for, session
from app import methods
from flask_bcrypt import Bcrypt
from sqlalchemy import insert, or_, and_, extract
from datetime import datetime
from dateutil.parser import parse
from sqlalchemy.orm import aliased
bcrypt = Bcrypt(app)


#Get all coaches or get coaches by id
@app.route('/getAllCoaches', methods=['GET'])
def get_all_coaches():
    email = request.args.get('email')

    if email:
        coach = Coaches.query.filter(Coaches.email == email).first()
        if coach:
            coach_data = {
                'coach_id': coach.coach_id,
                'name': coach.name,
                'email': coach.email,
                'phone': coach.phone,
                'sports': coach.sports,
                'institute': coach.institute
            }
            return jsonify(coach_data)
        else:
            return jsonify({'error': 'Coach not found'}), 404
    else:
        coaches = Coaches.query.all()
        coach_list = []
        for coach in coaches:
            coach_data = {
                'coach_id': coach.coach_id,
                'name': coach.name,
                'email': coach.email,
                'phone': coach.phone,
                'sports': coach.sports,
                'institute': coach.institute
            }
            coach_list.append(coach_data)
        return jsonify(coaches=coach_list)

#add a new coach to the system
@app.route('/addNewCoach', methods=['POST'])
def add_new_coach():
    try:
        data = request.get_json()
        new_coach = Coaches(
            name=data['name'],
            address=data['address'],
            email=data['email'],
            gender=data['gender']
        )
        db.session.add(new_coach)
        db.session.commit()

        return jsonify({'message': 'Coach added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/updateCoach', methods=['POST'])
def update_coach():
    try:
        data = request.json
        # Ensure that 'email' is present in the JSON data
        if 'email' not in data:
            return jsonify({'error': 'Email address is required for updating a coach'}), 400
        # Find the coach by email
        coach = Coaches.query.filter_by(email=data['email']).first()

        if coach:
            # Update the coach's information
            coach.name = data['name']
            coach.phone = data['phone']
            coach.sports = data['sports']
            coach.institute = data['institute']

            db.session.commit()
            return jsonify({'message': 'Coach updated successfully'}), 200
        else:
            return jsonify({'error': 'Coach not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/deleteCoach', methods=['DELETE'])
def delete_coach():
    try:
        email = request.args.get('email')

        if email is not None:
            # Find the coach by email
            coach = Coaches.query.filter_by(email=email).first()

            if coach:
                # Delete the coach from the database
                db.session.delete(coach)
                db.session.commit()
                return jsonify({'message': 'Coach deleted successfully'}), 200
            else:
                return jsonify({'error': 'Coach not found'}), 404
        else:
            return jsonify({'error': 'Email address is required for deleting a coach'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/deleteAthlete', methods=['DELETE'])
def delete_athlete():
    try:
        email = request.args.get('email')

        if email is not None:
            # Find the coach by email
            athlete = Athletes.query.filter_by(email=email).first()

            if athlete:
                # Delete the coach from the database
                db.session.delete(athlete)
                db.session.commit()
                return jsonify({'message': 'Athlete deleted successfully'}), 200
            else:
                return jsonify({'error': 'Athlete not found'}), 404
        else:
            return jsonify({'error': 'Email address is required for deleting an athlete'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


#Add an athlete
@app.route('/addAthlete', methods=['POST'])
def add_athlete():
    try:
        data = request.get_json()
        coach = Coaches.query.get(data['coach_id'])
        if not coach:
            return jsonify({'error': 'Coach not found'}), 404
        new_athlete = Athletes(
            name=data['name'],
            coach_id=data['coach_id']
        )
        db.session.add(new_athlete)
        db.session.commit()

        return jsonify({'message': 'Athlete added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400



#Add a team
@app.route('/addTeam', methods=['POST'])
def add_team():
    try:
        data = request.get_json()

        coach = Coaches.query.get(data['coach_id'])
        if not coach:
            return jsonify({'error': 'Coach not found'}), 404

        new_team = Teams(
            name=data['name'],
            sport=data['sport'],
            coach_id=data['coach_id']
        )

        db.session.add(new_team)

        db.session.commit()

        return jsonify({'message': 'Team added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


#Add Team Memberships
@app.route('/addTeamMemberships', methods=['POST'])
def add_team_membership():
    try:
        data = request.get_json()

        athlete = Athletes.query.get(data['athlete_id'])
        team = Teams.query.get(data['team_id'])

        if not athlete:
            return jsonify({'error': 'Athlete not found'}), 404

        if not team:
            return jsonify({'error': 'Team not found'}), 404

        new_membership = TeamMemberships(
            athlete_id=data['athlete_id'],
            team_id=data['team_id']
        )

        db.session.add(new_membership)

        db.session.commit()

        return jsonify({'message': 'Team membership added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# Add a workout
@app.route('/addNewWorkout', methods=['POST'])
def add_workout():
    try:
        data = request.get_json()
        if 'name' not in data or 'coach_id' not in data:
            return jsonify({'error': 'Missing required fields'}), 400

        if 'athlete_id' in data:
            athlete = Athletes.query.get(data['athlete_id'])
            if not athlete:
                return jsonify({'error': 'Athlete not found'}), 404

            new_workout = Workouts(name=data['name'], coach_id=data['coach_id'])
            db.session.add(new_workout)
            db.session.commit()

            athlete_workout = AthleteWorkouts(
                athlete_id=data['athlete_id'],
                workout_id=new_workout.workout_id,
                date_completed=data.get('date_completed')
            )
            db.session.add(athlete_workout)

        elif 'team_id' in data:
            team = Teams.query.get(data['team_id'])
            if not team:
                return jsonify({'error': 'Team not found'}), 404

            new_workout = Workouts(name=data['name'], coach_id=data['coach_id'])
            db.session.add(new_workout)
            db.session.commit()

            team_workout_assignment = TeamWorkoutsAssignments(
                team_id=data['team_id'],
                workout_id=new_workout.workout_id
            )
            db.session.add(team_workout_assignment)
        else:
            return jsonify({'error': 'Either athlete_id or team_id must be provided in the payload'}), 400

        db.session.commit()

        return jsonify({'message': 'Workout added successfully', 'workout_id': new_workout.workout_id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


# Add a new block
@app.route('/addNewBlock', methods=['POST'])

#Get athletes team wise for a particular coach
@app.route('/getAthletes', methods=['GET'])
def get_coach_with_teams_and_athletes():
    coach_id = request.args.get('coachId')
    if(coach_id is not None):
        try:
            coach = Coaches.query.get(coach_id)
            if not coach:
                return jsonify({'error': 'Coach not found'}), 404

            teams = Teams.query.filter_by(coach_id=coach_id).all()

            response_data = {
                'coach_id': coach.coach_id,
                'coach_name': coach.name,
                'teams': []
            }

            for team in teams:
                team_data = {
                    'team_id': team.team_id,
                    'team_name': team.name,
                    'athletes': []
                }
                athletes = Athletes.query.join(TeamMemberships).filter_by(team_id=team.team_id).all()

                for athlete in athletes:
                    athlete_data = {
                        'athlete_id': athlete.athlete_id,
                        'athlete_name': athlete.name,
                        'sport': team.sport 
                    }
                    team_data['athletes'].append(athlete_data)

                response_data['teams'].append(team_data)

            return jsonify(response_data), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'error: coachId not found in request'}), 400


# Create a route to add a new block
@app.route('/add_block', methods=['POST'])
def add_block():
    data = request.json
    athlete_id = data.get('athleteId')
    coach_id = data.get('coachId')
    date_added = data.get('selectedDate')

    # Ensure that required data is provided
    block_name = data.get('blockName')
    if not athlete_id or not coach_id or not block_name:
        return jsonify({'success': False, 'message': 'Invalid request data'})

    # Check if a workout exists for the specified athlete, coach, and date
    athlete_workout = AthleteWorkouts.query.filter_by(athlete_id=athlete_id, workout_id=date_added).first()

    if not athlete_workout:
        # If no athlete-workout mapping exists, create a new workout
        workout = Workouts(date_added=date_added, name="Workout Name", coach_id=coach_id)
        db.session.add(workout)
        db.session.commit()
        
        # Create an entry in AthleteWorkouts to associate the athlete with the workout
        athlete_workout = AthleteWorkouts(athlete_id=athlete_id, workout_id=workout.workout_id)
        db.session.add(athlete_workout)
        db.session.commit()
    else:
        workout = athlete_workout.workout

    # Create a new block under the selected workout
    new_block = Blocks(name=block_name, workout=workout)
    db.session.add(new_block)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Block added successfully'})


# Route to add an exercise (POST)
@app.route('/addNewExercise', methods=['POST'])
def add_exercise():
    try:
        # Parse the request JSON data
        data = request.get_json()

        # Ensure that the required fields are present in the request
        if 'block_id' not in data or 'name' not in data or 'loads_reps' not in data:
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if the specified block_id exists
        block = Blocks.query.get(data['block_id'])
        if not block:
            return jsonify({'error': 'Block not found'}), 404

        # Create a new exercise instance and add it to the database
        new_exercise = Exercises(
            block_id=data['block_id'],
            name=data['name'],
            loads_reps=data['loads_reps'],  # Use loads_reps for combined data
            sets=data.get('sets')
        )
        db.session.add(new_exercise)
        db.session.commit()

        # Return a success response
        return jsonify({'message': 'Exercise added successfully', 'exercise_id': new_exercise.exercise_id}), 201
    except Exception as e:
        # Handle any errors and return an error response
        return jsonify({'error': str(e)}), 400


# Get the coach ID
@app.route('/getMyCoach',methods=['GET'])
def get_my_coach():
    athlete_id = request.args.get('athleteId', type=int)
    if athlete_id is None:
        return jsonify({'error': 'Athlete_id not given'}), 400
    athlete = Athletes.query.get(athlete_id)
    if athlete is None:
        return jsonify({"error":"Athlete not found"}), 404
    # Retrieve the coach_id from athlete
    coach_id = athlete.coach_id
    return jsonify({"coach_id":coach_id}) , 200


# Getting the coaches
@app.route('/getMyCoaches',methods=['GET'])
def get_my_coaches():
    teams_list = []
    athlete_id = request.args.get('athleteId')
    # Check the teams of the athlete in team Memberships table 
    team_coach_ids = Teams.query.join(TeamMemberships).filter_by(athlete_id=athlete_id).with_entities(Teams.coach_id).distinct().all()
    # print(team_coach_ids) # [(1,), (1,), (2,)]

    # Coach ids from the teams
    if team_coach_ids:
        team_coach_ids = list(map(lambda x: {"coach_id" : x[0]} , team_coach_ids))
    else:
        team_coach_ids = []

    # Get coach_ids from the coach membership table
    individual_coach_ids = CoachAthleteMembership.query.filter_by(athlete_id=athlete_id).with_entities(CoachAthleteMembership.coach_id).distinct().all()
    # print(individual_coach_ids) 

    if individual_coach_ids : 
        # Coach ids from the teams
        individual_coach_ids = list(map(lambda x: {"coach_id" : x[0]} , individual_coach_ids))
    else:
        individual_coach_ids = []

    if not team_coach_ids and not individual_coach_ids:
        # Handle the case when both lists are empty
        return jsonify({"error": "No coaches found for the athlete"}), 404
    else:
        coach_ids = individual_coach_ids + team_coach_ids
        return jsonify(coach_ids), 200
    

# Getting my personal coaches
@app.route('/getMyPersonalCoaches',methods=['GET'])
def get_my_personal_coaches():
    athlete_id = request.args.get('athleteId')

    coaches = []
    # Get coach_ids from the coach membership table
    individual_coach_ids = CoachAthleteMembership.query.filter_by(athlete_id=athlete_id).with_entities(CoachAthleteMembership.coach_id).distinct().all()
    # print(individual_coach_ids) 

    if individual_coach_ids : 
        # Coach ids from the teams
        individual_coach_ids = list(map(lambda x: {"coach_id" : x[0]} , individual_coach_ids))
        # print("My individual coach_ids", individual_coach_ids)

    if not individual_coach_ids:
        # Handle the case when both lists are empty
        return jsonify({"error": "No coaches found for the athlete"}), 404
    

    for coach_id in individual_coach_ids:
        coach = Coaches.query.filter(Coaches.coach_id == coach_id["coach_id"]).first()
        if coach:
            coach_data = {
                        'coach_id': coach.coach_id,
                        'name': coach.name,
                        'email': coach.email,
                        'phone': coach.phone,
                        'sports': coach.sports,
                        'institute': coach.institute
                    }
            coaches.append(coach_data)
    return jsonify(coaches), 200


# Get the athlete ID
@app.route('/getAthleteId', methods=['GET'])
def get_athlete_id():
    athlete_username  = request.args.get('athleteUsername',type=str)
    if athlete_username is None: 
         return jsonify({'error': 'Athlete username  not given'}), 400
    athlete = Athletes.query.filter_by(email=athlete_username).first()
    if athlete:
        athlete_id = athlete.athlete_id
        return jsonify({"athlete_id":athlete_id}), 200
    else:
        return jsonify({"error":f"No athlete found with email/username {athlete_username}"}), 404


# Defining to get the workout by team
@app.route('/getWorkoutsByTeam', methods=['GET'])
def get_workouts_by_team():
    # Retrieve the parameters from the request
    team_id = request.args.get('teamId', type=int)
    date_str = request.args.get('date')
    coach_id = request.args.get('coachId', type=int)

    # Convert the date string to a datetime object (if provided)
    if date_str:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    else:
        date = None

    print(date)
    # Query the database to fetch the data based on the parameters
    assigned_workout_ids = TeamWorkoutsAssignments.query.filter_by(team_id=team_id).with_entities(TeamWorkoutsAssignments.workout_id).all()
    # print("Team assignment IDs : ", assigned_workout_ids)
    result = []

    for assignment in assigned_workout_ids:

        workout_id = assignment.workout_id

        workout = Workouts.query.get(workout_id)

        if ((workout.coach_id == coach_id) and (workout.date_added == date)):
            # print("Testing")
            workout_data = {
                'workout_id': workout.workout_id,
                'name': workout.name,
                'date_added': workout.date_added,
                'coach_id': workout.coach_id,
                'blocks': []
            }

            # print(workout_data)
            blocks = Blocks.query.filter_by(workout_id=workout.workout_id).all()

            for block in blocks:
                block_data = {
                    'block_id': block.block_id,
                    'name': block.name,
                    'exercises': []
                }
                # print(workout_data)
                exercises = Exercises.query.filter_by(block_id=block.block_id).all()

                for exercise in exercises:
                    exercise_data = {
                        'exercise_id': exercise.exercise_id,
                        'name': exercise.name,
                        'loads_reps': exercise.loads_reps,
                        'sets': exercise.sets
                    }

                    block_data['exercises'].append(exercise_data)

                workout_data['blocks'].append(block_data)
            # print(workout_data)
            result.append(workout_data)

    return jsonify(result)


# Get a particular Workout by athlete_id
@app.route('/getWorkoutsByAthleteDirect', methods=['GET'])
def get_workouts_by_athlete_membership():
    athlete_id = request.args.get('athleteId', type=int)
    date_str = request.args.get('date')
    coach_id = request.args.get('coachId', type=int)
    

    # 2 places to check : AthleteWorkouts Table & TeamWorkouts Table
    # Parse the date parameter if provided
    date = None
    if date_str:
        date = datetime.strptime(date_str, '%Y-%m-%d')
    
    # Query the workouts assigned to the athlete by their ID, date (if provided), and coach_id
    if athlete_id:
        workouts = Workouts.query.join(AthleteWorkouts,AthleteWorkouts.workout_id == Workouts.workout_id).filter_by(athlete_id=athlete_id)
    else:
        return jsonify({'error': 'Athlete_id not found'}), 404
    
    print(workouts)

    if date:
        workouts = workouts.filter(Workouts.date_added == date)
    
    print(workouts)


    if coach_id:
        workouts = workouts.filter(Workouts.coach_id == coach_id)
        print(workouts)
    else:
        return jsonify({'error': 'Coach_id not found'}),400
    workouts = workouts.all()
    print(workouts)
    
    results = []
    #workout_data = []
    for workout in workouts:
        #blocks = Blocks.query.filter_by(workout_id=workout.workout_id).all()
        # exercises = []

        # for block in blocks:
        #     block_exercises = Exercises.query.filter_by(block_id=block.block_id).all()
        #     exercises.extend([{
        #         'name': exercise.name,
        #         'loads_reps': exercise.loads_reps,
        #         'sets': exercise.sets
        #     } for exercise in block_exercises])

        # workout_data.append({
        #     'workout_name': workout.name,
        #     'date_added': workout.date_added.strftime('%Y-%m-%d'),
        #     'blocks': [block.name for block in blocks],
        #     'exercises': exercises
        # })

        workout_data = {
                    'workout_id': workout.workout_id,
                    'name': workout.name,
                    'date_added': workout.date_added,
                    'coach_id': workout.coach_id,
                    'blocks': []
                    }

                # print(workout_data)
        blocks = Blocks.query.filter_by(workout_id=workout.workout_id).all()

        for block in blocks:
            block_data = {
                'block_id': block.block_id,
                'name': block.name,
                'exercises': []
            }
            # print(workout_data)
            exercises = Exercises.query.filter_by(block_id=block.block_id).all()

            for exercise in exercises:
                exercise_data = {
                    'exercise_id': exercise.exercise_id,
                    'name': exercise.name,
                    'loads_reps': exercise.loads_reps,
                    'sets': exercise.sets
                }

                block_data['exercises'].append(exercise_data)

            workout_data['blocks'].append(block_data)
        # print(workout_data)
        results.append(workout_data)
    return jsonify(results)

@app.route('/getWorkoutDates', methods=['GET'])
def get_workout_dates():
    date_param = request.args.get('date_param')  
    year, month = None, None
    if date_param and len(date_param.split('-')) == 2:
        year_str, month_str = date_param.split('-')
        try:
            year = int(year_str)
            month = int(month_str)
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM'}), 400
    workout_dates = set()
    coach_id = request.args.get('coachId', type=int)
    if coach_id is not None:
        workouts = Workouts.query.filter_by(coach_id=coach_id).all()
        tests_workouts = TestsWorkouts.query.filter_by(coach_id=coach_id).all()
        for tests in tests_workouts:
            tests_workouts_year = tests.date_added.year
            tests_workouts_month = tests.date_added.month
            if (year is None or tests_workouts_year == year) and (month is None or tests_workouts_month == month):
                workout_dates.add(tests.date_added.strftime('%m-%d-%Y'))
        for workout in workouts:
            workout_year = workout.date_added.year
            workout_month = workout.date_added.month
            if (year is None or workout_year == year) and (month is None or workout_month == month):
                workout_dates.add(workout.date_added.strftime('%m-%d-%Y'))
        return jsonify({'workoutDates': list(workout_dates)})
    else:
        team_ids = request.args.getlist('teamId', type=int)
        athlete_id = request.args.get('athleteId', type=int)
        # Initialize year and month as None

        if team_ids:
            # Retrieve workout dates for the teams
            assigned_workout_ids = TeamWorkoutsAssignments.query.filter(TeamWorkoutsAssignments.team_id.in_(team_ids))\
                                                            .with_entities(TeamWorkoutsAssignments.workout_id).all()
            assigned_tests_workout_ids = TestsTeamWorkoutsAssignments.query.filter(TestsTeamWorkoutsAssignments.team_id.in_(team_ids))\
                                                            .with_entities(TestsTeamWorkoutsAssignments.test_workout_id).all()
            for assignment in assigned_workout_ids:
                workout_id = assignment.workout_id
                workout = Workouts.query.get(workout_id)
                if workout:
                    workout_year = workout.date_added.year
                    workout_month = workout.date_added.month
                    if (year is None or workout_year == year) and (month is None or workout_month == month):
                        workout_dates.add(workout.date_added.strftime('%m-%d-%Y'))

            for assignment in assigned_tests_workout_ids:
                test_workout_id = assignment.test_workout_id
                test_workout = TestsWorkouts.query.get(test_workout_id)
                if test_workout:
                    tests_workout_year = test_workout.date_added.year
                    tests_workout_month = test_workout.date_added.month
                    if (year is None or tests_workout_year == year) and (month is None or tests_workout_month == month):
                        workout_dates.add(test_workout.date_added.strftime('%m-%d-%Y'))
        
        if athlete_id:
            # Retrieve workout dates for the athlete
            workouts = Workouts.query.join(AthleteWorkouts, AthleteWorkouts.workout_id == Workouts.workout_id)\
                                    .filter(AthleteWorkouts.athlete_id == athlete_id)
            tests_workouts = TestsWorkouts.query.join(TestsAthleteWorkouts, TestsAthleteWorkouts.test_workout_id == TestsWorkouts.test_workout_id)\
                                    .filter(TestsAthleteWorkouts.athlete_id == athlete_id)
            
            if year is not None and month is not None:
                workouts = workouts.filter(
                    and_(
                        extract('year', Workouts.date_added) == year,
                        extract('month', Workouts.date_added) == month
                    )
                ).distinct(Workouts.date_added)
            for workout in workouts:
                workout_year = workout.date_added.year
                workout_month = workout.date_added.month
                
                if workout_year == year and workout_month == month:
                    workout_dates.add(workout.date_added.strftime('%m-%d-%Y'))

            if year is not None and month is not None:
                tests_workouts = tests_workouts.filter(
                    and_(
                        extract('year', TestsWorkouts.date_added) == year,
                        extract('month', TestsWorkouts.date_added) == month
                    )
                ).distinct(TestsWorkouts.date_added)
            for tests in tests_workouts:
                tests_year = tests.date_added.year
                tests_month = tests.date_added.month
                
                if tests_year == year and tests_month == month:
                    workout_dates.add(tests.date_added.strftime('%m-%d-%Y'))

        return jsonify({'workoutDates': list(workout_dates)})



# Get a particular workout with workout id
@app.route('/getWorkout', methods=['GET'])
def get_workout():
    try:
        athlete_id = request.args.get('athleteId', type=int)
        team_id = request.args.get('teamId', type=int)
        coach_id = request.args.get('coachId', type=int)
        date = request.args.get('date', type=str)  # You can adjust the data type as needed

        workouts_query = Workouts.query

        if athlete_id is not None:
            workouts_query = workouts_query.filter(
                Workouts.workout_id.in_(
                    db.session.query(AthleteWorkouts.workout_id).filter_by(athlete_id=athlete_id)
                )
            )
        elif team_id is not None:
            workouts_query = workouts_query.filter(
                Workouts.workout_id.in_(
                    db.session.query(TeamWorkoutsAssignments.workout_id).filter_by(team_id=team_id)
                )
            )
        else:
            return jsonify({"error": "Provide either athleteId or teamId"}), 400

        if coach_id is not None:
            workouts_query = workouts_query.filter_by(coach_id=coach_id)
        
        if date:
            workouts_query = workouts_query.filter(Workouts.date_added == date)

        workouts = workouts_query.all()

        if not workouts:
            return jsonify({'message': 'No workouts found with the provided constraints'})

        workout_list = []
        for workout in workouts:
            workout_data = {
                'workout_name': workout.name,
                'date_added': workout.date_added.strftime('%Y-%m-%d'),
                'coach_name': workout.coach.name,
                'blocks': []
            }

            blocks = Blocks.query.filter_by(workout_id=workout.workout_id).all()

            for block in blocks:
                block_data = {
                    'block_name': block.name,
                    'exercises': []
                }

                exercises = Exercises.query.filter_by(block_id=block.block_id).all()

                for exercise in exercises:
                    exercise_data = {
                        'exercise_name': exercise.name,
                        'loads_reps': exercise.loads_reps,
                        'sets': exercise.sets
                    }
                    block_data['exercises'].append(exercise_data)

                workout_data['blocks'].append(block_data)

            workout_list.append(workout_data)

        return jsonify(workout_list), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


# Get a particular workout with workout id
@app.route('/getWorkout2', methods=['GET'])
def get_workout2():
    try:
        athlete_id = request.args.get('athleteId', type=int)
        team_id = request.args.get('teamId', type=int)
        coach_id = request.args.get('coachId', type=int)
        date = request.args.get('date', type=str)  # You can adjust the data type as needed

        workouts_query = Workouts.query
        workouts_query_1 = []
        workouts_query_2 = []
        if athlete_id is not None:
            #print("athlete id given")
            workouts_query_1 = workouts_query.filter(
                Workouts.workout_id.in_(
                    db.session.query(AthleteWorkouts.workout_id).filter_by(athlete_id=athlete_id)
                )
            )
            print(workouts_query_1)

        if team_id is not None:
            #print("teamId id given")
            workouts_query_2 = workouts_query.filter(
                Workouts.workout_id.in_(
                    db.session.query(TeamWorkoutsAssignments.workout_id).filter_by(team_id=team_id)
                )
            )
            print(workouts_query_2)

        if not athlete_id and not team_id :
            return jsonify({"error": "Provide either athleteId or teamId"}), 400
        
        if workouts_query_1:
            if coach_id is not None:
                workouts_query_1 = workouts_query_1.filter_by(coach_id=coach_id)
            
            if date:
                print("Inside this date", type(date))
                workouts_query_1 = workouts_query_1.filter(Workouts.date_added == date)

            workouts_query_1 = workouts_query_1.all() 
            

        if workouts_query_2:
            if coach_id is not None:
                workouts_query_2 = workouts_query_2.filter_by(coach_id=coach_id)
            
            if date :
                print("Inside this date",type(date))
                workouts_query_2 = workouts_query_2.filter(Workouts.date_added == date)

            workouts_query_2 = workouts_query_2.all()
        workouts = workouts_query_1 + workouts_query_2 

        # workouts = workouts_query.all()
        print(workouts)
        if not workouts:
            return jsonify({'message': 'No workouts found with the provided constraints'})

        workout_list = []
        for workout in workouts:
            workout_data = {
                'workout_name': workout.name,
                'date_added': workout.date_added.strftime('%Y-%m-%d'),
                'coach_name': workout.coach.name,
                'blocks': []
            }

            blocks = Blocks.query.filter_by(workout_id=workout.workout_id).all()

            for block in blocks:
                block_data = {
                    'block_name': block.name,
                    'exercises': []
                }

                exercises = Exercises.query.filter_by(block_id=block.block_id).all()

                for exercise in exercises:
                    exercise_data = {
                        'exercise_name': exercise.name,
                        'loads_reps': exercise.loads_reps,
                        'sets': exercise.sets
                    }
                    block_data['exercises'].append(exercise_data)

                workout_data['blocks'].append(block_data)

            workout_list.append(workout_data)

        return jsonify(workout_list), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


#To add a new note
@app.route('/addNote', methods=['POST'])
def add_note():
    data = request.json
    new_note = Notes(
        coach_id=data['coach_id'],
        athlete_id=data['athlete_id'],
        date_created=data['date_created'],
        subject=data['subject'],
        coach_reply=data.get('coach_reply', None),
        athlete_reply=data.get('athlete_reply', None)
    )
    db.session.add(new_note)
    db.session.commit()
    return jsonify({"message": "Note added successfully"})

#Update Note 
@app.route('/updateNote/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    data = request.json
    new_athlete_reply = data.get('athlete_reply')
    note_to_update = Notes.query.get(note_id)

    if note_to_update:
        note_to_update.athlete_reply = new_athlete_reply
        db.session.commit()
        return jsonify({"message": "Note updated successfully"})
    else:
        return jsonify({"message": "Note not found or update failed"}, 404)


# Define a route to retrieve notes for a specific coach and athlete with only date_created and content
@app.route('/getNotes', methods=['GET'])
def get_notes():
    coach_id = request.args.get('coachId')
    athlete_id = request.args.get('athleteId')

    if not coach_id or not athlete_id:
        return jsonify({"error": "Both coachId and athleteId are required"}), 400

    notes = notes = Notes.query.filter_by(coach_id=coach_id, athlete_id=athlete_id)\
                   .order_by(Notes.date_created.desc())\
                   .all()


    if not notes:
        return jsonify({"message": "No notes found for the given coach and athlete"})

    note_list = [
        {
            'note_id': note.note_id,
            'date_created': note.date_created.strftime('%Y-%m-%d'),
            'subject': note.subject,
            'athlete_reply': note.athlete_reply,
            'coach_reply': note.coach_reply
        }
        for note in notes
    ]

    return jsonify({"notes": note_list})

@app.route('/getNotesforathlete', methods=['GET'])
def get_notes_athlete():
    athlete_id = request.args.get('athleteId')

    if not athlete_id:
        return jsonify({"error": "athleteId is required"}), 400

    notes = Notes.query.filter_by(athlete_id=athlete_id)\
               .order_by(Notes.note_id.desc())\
               .all()

    if not notes:
        return jsonify({"message": "No notes found for the given athlete"}), 404

    note_list = [
        {
            'note_id': note.note_id,
            'date_created': note.date_created.strftime('%Y-%m-%d'),
            'subject': note.subject,
            'athlete_reply': note.athlete_reply,
            'coach_reply': note.coach_reply,
            'coach_id' : note.coach_id

        }
        for note in notes
    ]

    return jsonify({"notes": note_list})




#Route for coach home
@app.route('/coachAthleteHome')
def coach_signup():
    return render_template("login.html")

#Route for coach login
@app.route('/coachLogin', methods=['POST'])
def coach_login():
    if request.method == 'POST':
        data = request.get_json(force=True)
        if 'username' in session:
            return "session"
        else:
            if methods.coaches_username_is_valid(data.get('username'), data.get('password')):
                session['username'] = data.get('username')
                return "Successful"
            else:
                message="Wrong coach username password!"
                return message

@app.route('/coachLanding2')
def coach_landing2():
    # Retrieve the athlete_id from the session
    coach_id = session.get('coach_id')
    
    # Use athlete_id to query additional user-specific data from the database if needed

    # Render the landing page
    return render_template('coach-landing-page.html', coach_id=coach_id)

#Route for athlete login
@app.route('/athleteLogin', methods=['POST'])
def athlete_login():
    if request.method == 'POST':
        data = request.get_json(force=True)
        if 'username' in session:
            return "session"
        else:
            if methods.athlete_username_is_valid(data.get('username'), data.get('password')):
                session['username'] = data.get('username')
                return "Successful"
            else:
                message="Wrong athlete username password!"
                return message
        
# Route for athlete login
@app.route('/athleteLogin2', methods=['POST'])
def athlete_login2():
    if request.method == 'POST':
        data = request.get_json(force=True)
        # print(data)
        athlete_fetched =  methods.athlete_username_is_valid(data.get('username'), data.get('password'))
        
        # If None is returned , wrong username
        if not (athlete_fetched):   
            message="Wrong athlete username password!"
            return message
        else:
            session['username'] = data.get('username')
            # session['testing'] = 'SESSION VALUE 156' 
            return "Successful"
            # return  Details of the user   ## FIXME: REQUIRED OR NOT
            # athlete_data = {
            #     'athlete_id': athlete_fetched.athlete_id,
            #     'name': athlete_fetched.name,
            #     'phone': athlete_fetched.phone,
            #     'email': athlete_fetched.email,
            #     'gender': athlete_fetched.gender,
            #     'sports':athlete_fetched.sports,
            #     'institute':athlete_fetched.institute,
            #     'age':athlete_fetched.age,
            # }



#Route for succesful athlete login and landing page
@app.route('/athleteLanding')
def athlete_landing():
    athlete_username  = session.get('username', 'Invalid Login:BREACH')
    return render_template("athlete_landing-page.html",athlete_username=athlete_username)


#Route for coach registration page
@app.route('/registerCoach')
def register_coach():
    return render_template("registration-coach.html")


#Route for session error
@app.route('/sessionError')
def session_error():
    return render_template("logged-in.html")


#Route for athlete registration page
@app.route('/registerAthlete')
def register_athlete():
    return render_template("registration-athlete.html")


#Route for athlete registration post to DB
@app.route('/postAthlete', methods=['POST'])
def post_athlete():
    data = request.get_json(force=True)
    email = data.get('email')
    phone=data.get('phone')
    existing_athlete = Athletes.query.filter_by(email=email).first() or Athletes.query.filter_by(phone=phone).first()
    if existing_athlete:
        return "User exists, try logging in!"
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    if 'sports' in data and isinstance(data['sports'], list):
        sports_string = ','.join(data['sports'])
    # If email does not exist, create a new athlete
    new_athlete = Athletes(
        name=data['name'],
        phone=data['phone'],
        gender=data['gender'],
        password=hashed_password,
        email=data['email'],
        age=data.get('age'),
        sports=sports_string,
        institute=data.get('institute')
    )
    
    db.session.add(new_athlete)
    db.session.commit()
    return "Registration successful, go to login!"


#Route for coach registration post to DB
@app.route('/postCoach', methods=['POST'])
def post_coach():
    data = request.get_json(force=True)
    email = data.get('email')
    phone=data.get('phone')
    existing_coach = Coaches.query.filter_by(email=email).first() or Coaches.query.filter_by(phone=phone).first()
    if existing_coach:
        return "User exists, try logging in!"
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    if 'sports' in data and isinstance(data['sports'], list):
        sports_string = ', '.join(data['sports'])
    # If email does not exist, create a new athlete
    new_coach = Coaches(
        name=data['name'],
        phone=data['phone'],
        sports=sports_string,
        institute=data.get('institute'),
        password=hashed_password,
        email=data['email']
    )
    db.session.add(new_coach)
    db.session.commit()
    return "Registration successful, go to login!"


@app.route('/adminLogin')
def admin_login():
    return render_template("admin_login.html")


#Route for athlete login
@app.route('/adminPost', methods=['POST'])
def admin_post():
    if request.method == 'POST':
        data = request.get_json(force=True)
        if methods.admin_username_is_valid(data.get('username'), data.get('password')):
            session['username'] = data.get('username')
            return "Successful"
        else:
            message="Wrong admin username password!"
            return message


#Route for succesful athlete login and landing page
@app.route('/adminLanding')
def admin_landing():
    if 'username' in session:
        return render_template("admin-coach.html")
    else:
        return redirect(url_for('admin_login')) 

#Route for succesful athlete login and landing page
@app.route('/adminExercises')
def admin_exercises():
    if 'username' in session:
        return render_template("admin-define-exercises.html")
    else:
        return redirect(url_for('admin_login')) 


#Route for admin athlete view
@app.route('/adminAthlete')
def admin_athlete():
    if 'username' in session:
        return render_template("admin-athlete.html")
    else:
        return redirect(url_for('admin_login')) 


#Route for coach landing
@app.route('/coachLanding')
def coach_landing():
    return render_template("coach-landing-page.html")

@app.route('/')
def home():
    return render_template("index.html")







@app.route('/athleteSelectedTeamTraining')
def athlete_view_selected_training():
    team_id = request.args.get('teamId')
    athlete_id = request.args.get('athleteId')
    return render_template('athlete-view-training.html',teamId=team_id, athleteId=athlete_id)



@app.route('/viewTeam')
def viewTeam():
    return render_template('view-team.html')

@app.route('/createTeam')
def createTeam():
    return render_template('create-team.html')

@app.route('/addTeamAthlete')
def addTeamAthlete():
    return render_template('add-team-athlete.html')

@app.route('/workoutSelection')
def workoutSelection():
    return render_template('workout-selection.html')

@app.route('/testSelection')
def testSelection():
    return render_template('test-selection.html')

@app.route('/athleteSelection')
def athleteSelection():
    return render_template('athlete-datatable.html')

@app.route('/testAthleteSelection')
def testAthleteSelection():
    return render_template('test-athlete-datatable.html')

@app.route('/teamSelection')
def teamSelection():
    return render_template('team-datatable.html')

@app.route('/testTeamSelection')
def testTeamSelection():
    return render_template('test-team-datatable.html')

@app.route('/athleteWorkout')
def athleteWorkout():
    return render_template('athlete-workout.html')

@app.route('/coachAthleteWorkout')
def coachAthleteWorkout():
    return render_template('coach-athlete-training.html')

@app.route('/teamWorkout')
def teamWorkout():
    return render_template('team-workout.html')

@app.route('/coachTeamTest')
def coachTeamTest():
    return render_template('tests-coach-athlete-training.html')

@app.route('/coachAthleteTest')
def coachAthleteTest():
    return render_template('tests-coach-athlete-training.html')

@app.route('/coachTeamWorkout')
def coachTeamWorkout():
    return render_template('coach-athlete-training.html')

@app.route('/assignExercise')
def assignExercise():
    return render_template('coach-athlete-training.html')

# @app.route('/assignExercise')
# def assignExercise():
#     return render_template('assign-exercise_tree.html')

@app.route('/coachNotes')
def coachNotes():
    return render_template('coachNotes.html')


@app.route('/testsAthleteLanding')
def tests_athlete_landing():
    athlete_username  = session.get('username', 'Invalid Login:BREACH')
    return render_template("tests-athlete_landing-page.html",athlete_username=athlete_username)



@app.route('/defineExercises')
def defineExercises():
    return render_template('define-exercises.html')

@app.route('/coachProfile')
def coachProfile():
    # return render_template('/coach-profile.html')
        # Get the session data and pass it to the template
    session_data = {
        'username': session.get('username')
        # Add other session data as needed
    }
    return render_template('coach-profile.html', session=session_data)

@app.route('/athleteProfile')
def athleteProfile():
    # return render_template('/coach-profile.html')
        # Get the session data and pass it to the template
    session_data = {
        'username': session.get('username')
        # Add other session data as needed
    }
    return render_template('athlete-profile.html', session=session_data)

# Route to create a new team and add athletes to it
@app.route('/createTeamAndMemberships', methods=['POST'])
def create_team_and_memberships():
    try:
        data = request.get_json()

        # Validate data and check for required fields
        if 'name' not in data or 'sport' not in data or 'coach_id' not in data:
            return jsonify({'error': 'Missing required fields'}), 400

        coach = Coaches.query.get(data['coach_id'])
        if not coach:
            return jsonify({'error': 'Coach not found'}), 404

        new_team = Teams(
            name=data['name'],
            sport=data['sport'],
            coach_id=data['coach_id']
        )

        db.session.add(new_team)
        db.session.commit()

        team_id = new_team.team_id

        # Iterate over the list of athlete_ids and create team memberships
        for athlete_id in data['athlete_ids']:
            athlete = Athletes.query.get(athlete_id)

            if not athlete:
                return jsonify({'error': f'Athlete with ID {athlete_id} not found'}), 404

            new_membership = TeamMemberships(
                athlete_id=athlete_id,
                team_id=team_id
            )

            db.session.add(new_membership)

        db.session.commit()

        # Check if athlete_ids is not provided or is an empty array
        if not data['athlete_ids']:
            return jsonify({'message': 'Team created successfully'}), 201
        else:
            return jsonify({'message': 'Team created and athletes added successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400

    
@app.route('/getAthletesForTeam', methods=['GET'])
def get_athletes_for_team():
    team_id = request.args.get('teamId')
    if team_id is not None:
        try:
            team = Teams.query.get(team_id)
            if not team:
                return jsonify({'error': 'Team not found'}), 404

            athletes = Athletes.query.join(TeamMemberships).filter_by(team_id=team_id).all()

            # Creating a list of athlete data
            athlete_list = []

            for athlete in athletes:
                athlete_data = {
                    'athlete_id': athlete.athlete_id,
                    'name': athlete.name,
                    'email': athlete.email,
                    'phone': athlete.phone,
                    'sports': athlete.sports,
                    'institute': athlete.institute,
                    'gender': athlete.gender,
                    'age': athlete.age,
                }
                athlete_list.append(athlete_data)

            return jsonify(athletes=athlete_list), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'error': 'teamId not found in the request'}), 400

@app.route('/getTeamsForAthleteByCoach', methods=['GET'])
def get_teams_for_athlete_by_coach():
    athlete_id = request.args.get('athleteId',type=int)
    coach_id = request.args.get('coachId', type=int)
    if athlete_id is not None:
        try:
            # Check condition for athlete
            athlete = Athletes.query.filter_by(athlete_id=athlete_id).first()
            # print(athlete)
            if not athlete:
                return jsonify({"Error" : "Athlete note found"}), 400
            
            teams =  Teams.query.join(TeamMemberships).filter(Teams.coach_id == coach_id).filter(TeamMemberships.athlete_id == athlete_id).all()
            if teams is not None: 
                teams_list = []

                for team in teams:
                    team_data = {
                        'team_id': team.team_id,
                        'name': team.name,
                        'sport': team.sport,
                        'coach_id': team.coach_id,
                    }
                    teams_list.append(team_data)

                return jsonify(teams=teams_list), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'error': 'teamId not found in the request'}), 400
    

@app.route('/getWorkoutforAthletebyTeamsByCoach')
def get_workouts():
    athlete_id = request.args.get('athleteId')
    coach_id = request.args.get('coachId')
    date = request.args.get('date')
    
    if date:
        teams = db.session.query(Teams).filter(Teams.coach_id == coach_id)
        # teams = teams.filter(Workouts.date_added == date)
    else:
        teams = db.session.query(Teams).filter(Teams.coach_id == coach_id)

    teams = teams.join(TeamMemberships).filter(TeamMemberships.athlete_id == athlete_id)
    teams = teams.all()

    result = []
    for team in teams:
        team_data = {
            "team_id": team.team_id,
            "team_name": team.name,
            "workouts": []
        }

        team_workouts = db.session.query(TeamWorkoutsAssignments).filter_by(team_id=team.team_id).all()

        for team_workout in team_workouts:
            workout_data = {
                "workout_name": db.session.query(Workouts).get(team_workout.workout_id).name,
                "date_added": db.session.query(Workouts).get(team_workout.workout_id).date_added.strftime('%Y-%m-%d'),
                "blocks": []
            }

            blocks = db.session.query(Blocks).filter_by(workout_id=team_workout.workout_id).all()

            for block in blocks:
                block_data = {
                    "block_name": block.name,
                    "exercises": []
                }

                exercises = db.session.query(Exercises).filter_by(block_id=block.block_id).all()

                for exercise in exercises:
                    exercise_data = {
                        "exercise_name": exercise.name,
                        "loads_reps": exercise.loads_reps,
                        "sets": exercise.sets
                    }

                    block_data["exercises"].append(exercise_data)

                workout_data["blocks"].append(block_data)

            team_data["workouts"].append(workout_data)

        result.append(team_data)

    return jsonify(result)

@app.route('/getTeamsForAthlete', methods=['GET'])
def get_teams_for_athlete():
    athlete_id = int(request.args.get('athleteId'))
    if athlete_id is not None:
        try:
            athlete = Athletes.query.filter_by(athlete_id=athlete_id).first()
            # print(athlete)
            if not athlete:
                return jsonify({"Error" : "Athlete note found"}), 400
            
            teams = Teams.query.join(TeamMemberships).filter_by(athlete_id=athlete_id).all()

            if teams is not None: 
                teams_list = []

                for team in teams:
                    team_data = {
                        'team_id': team.team_id,
                        'name': team.name,
                        'sport': team.sport,
                        'coach_id': team.coach_id,
                    }
                    teams_list.append(team_data)

                return jsonify(teams=teams_list), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'error': 'teamId not found in the request'}), 400




@app.route('/getTeamsForAthlete2', methods=['GET'])
def get_teams_for_athlete2():
    athlete_id = int(request.args.get('athlete_id'))
    if athlete_id is not None:
        try:
            athlete = Athletes.query.filter_by(athlete_id=athlete_id)
            if not athlete:
                return jsonify({"Error" : "Athlete note found"}), 400
            
            # Query the TeamMemberships table to get the teams of the athlete
            team_memberships = TeamMemberships.query.filter_by(athlete_id=athlete_id).all()
            
            # Extract the team IDs from the team memberships
            team_ids = [membership.team_id for membership in team_memberships]
            
            # Query the Teams table to get the details of the teams
            teams = Teams.query.filter(Teams.team_id.in_(team_ids)).all()
            
            # Prepare a list of team details
            team_list = []
            for team in teams:
                team_list.append({
                    'team_id': team.team_id,
                    'name': team.name,
                    'sport': team.sport,
                    'coach_id': team.coach_id
                })
            
            return jsonify({'teams': team_list})
        
        except Exception as e:
            return jsonify({'error': str(e)})
    

# Define the /getTeamName API endpoint
@app.route('/getTeamName', methods=['GET'])
def get_team_name():
    # Get the teamId from the query parameters
    team_id = request.args.get('teamId')

    # Query the Teams model to get the team name
    team = Teams.query.get(team_id)

    if team:
        # Team exists; retrieve the name and sport
        team_name = team.name
        team_sport = team.sport

        return jsonify({'teamName': team_name, 'team_sport': team_sport})
    else:
        # Team not found
        return jsonify({'error': 'Team not found'}), 404
    

@app.route('/removeAthleteFromTeam', methods=['DELETE'])
def remove_athlete_from_team():
    try:
        athlete_id = int(request.form.get('athleteId'))
        team_id = int(request.form.get('teamId'))

        # Remove the athlete from the team
        team_membership = TeamMemberships.query.filter_by(athlete_id=athlete_id, team_id=team_id).first()
        if team_membership:
            db.session.delete(team_membership)
            db.session.commit()
            return jsonify({"message": "Athlete removed from the team successfully"})
        else:
            return jsonify({"error": "Athlete not found in the team"})

    except Exception as e:
        return jsonify({"error": "Failed to remove athlete from the team: " + str(e)})
    

@app.route('/deleteTeam', methods=['DELETE'])
def delete_team():
    try:
        team_id = int(request.form.get('teamId'))

        # Delete the team and its memberships
        team = Teams.query.get(team_id)
        if team:
            # Delete the associated team memberships
            TeamMemberships.query.filter_by(team_id=team_id).delete()
            db.session.delete(team)
            db.session.commit()
            return jsonify({"message": "Team and its memberships deleted successfully"})
        else:
            return jsonify({"error": "Team not found"})

    except Exception as e:
        return jsonify({"error": "Failed to delete team: " + str(e)})
                       

# Define a route to update the team name
@app.route('/updateTeamName', methods=['PUT'])
def update_team_name():
    try:
        # Get the team ID from the request
        team_id = request.args.get('teamId')
        
        # Get the new team name from the request
        new_team_name = request.json.get('newTeamName')

        # Retrieve the team record from the database
        team = Teams.query.filter_by(team_id=team_id).first()

        if team:
            # Update the team name
            team.name = new_team_name

            # Commit the changes to the database
            db.session.commit()

            # Respond with a success message
            return jsonify({'message': 'Team name updated successfully'})
        else:
            return jsonify({'error': 'Team not found'})

    except Exception as e:
        # Handle errors and respond with an error message
        return jsonify({'error': 'Failed to update team name', 'details': str(e)})
    

# API endpoint to add an athlete to the team
@app.route('/addAthleteToTeam', methods=['POST'])
def add_athlete_to_team():
    try:
        data = request.json
        team_id = data.get('team_id')
        athlete_id = data.get('athlete_id')


        # Check if the athlete is already a member of the team
        existing_membership = TeamMemberships.query.filter_by(
            team_id=team_id, athlete_id=athlete_id).first()

        if existing_membership:
            return jsonify({'message': 'Athlete is already a member of the team.'}), 400

        # Create a new membership
        membership = TeamMemberships(team_id=team_id, athlete_id=athlete_id)
        db.session.add(membership)
        db.session.commit()

        return jsonify({'message': 'Athlete added to the team successfully.'}), 201

    except IntegrityError:
        # Handle database integrity errors (e.g., duplicate keys)
        return jsonify({'error': 'Database integrity error. Athlete might already be a member of the team.'}), 400
    except Exception as e:
        # Handle other exceptions
        return jsonify({'error': 'Failed to add athlete to the team.', 'details': str(e)}), 500
    

@app.route('/getCoachId', methods=['GET'])
def get_coach_id():
    coach_id = session.get('coach_id')
    
    if coach_id is not None:
        return jsonify({'coach_id': coach_id})
    else:
        return jsonify({'error': 'Coach ID not found in the session'}), 404


@app.route('/getAllAthletes', methods=['GET'])
def get_all_athletes():
    # Get the coach_id from the request parameters
    coach_id = request.args.get('coach_id')

    if coach_id is None:
        return jsonify(error="Missing coach_id parameter")

    # Query the database to get athletes associated with the specified coach_id
    athlete_membership_records = CoachAthleteMembership.query.filter_by(coach_id=coach_id).all()

    # Create a list to store the athlete data
    athlete_list = []

    # Iterate through the athlete_membership_records and retrieve athlete details
    for record in athlete_membership_records:
        athlete = Athletes.query.get(record.athlete_id)
        if athlete:
            athlete_data = {
                'athlete_id': athlete.athlete_id,
                'email': athlete.email,
                'name': athlete.name,
                'sports': athlete.sports,
                'institute': athlete.institute,
                'coach_id': coach_id  # Since coach_id is from the request parameter
                # Add more fields as needed
            }
            athlete_list.append(athlete_data)

    # Return the athlete data as JSON
    return jsonify(athletes=athlete_list)


# Get unassigned athletes filtered by coach's sports and institute
@app.route('/getNewAthletesByCoachSportsInstitutes', methods=['GET'])
def get_new_athletes_by_coach_sports_institutes():
    # Get parameters from the request
    coach_id = request.args.get('coach_id')
    coach_institute = request.args.get('coachInstitute')
    coach_sports = request.args.get('coachSports')

    # Split the coach_sports string into a list
    coach_sports_list = coach_sports.split(',')

    if coach_id is None or coach_institute is None or coach_sports is None:
        return jsonify(error="Missing parameters")

    # Query athletes who do not have a coach_id assigned and match the specified sports and institute
    new_athlete_records = Athletes.query.filter(
        Athletes.athlete_id.notin_(
            db.session.query(CoachAthleteMembership.athlete_id).filter_by(coach_id=coach_id)
        ),
        or_(*(Athletes.sports.like(f"%{sport}%") for sport in coach_sports_list)),
        Athletes.institute == coach_institute
    ).all()

    # Create a list to store the new athlete data
    new_athlete_list = []

    # Iterate through the new_athlete_records and retrieve athlete details
    for athlete in new_athlete_records:
        new_athlete_data = {
            'athlete_id': athlete.athlete_id,
            'email': athlete.email,
            'name': athlete.name,
            'sports': athlete.sports,
            'institute': athlete.institute,
            'coach_id': coach_id
            # Add more fields as needed
        }
        new_athlete_list.append(new_athlete_data)

    # Return the new athlete data as JSON
    return jsonify(new_athletes=new_athlete_list)


# Filtered athletes by sports for creating a team
@app.route('/getAthletesBySports', methods=['GET'])
def get_athletes_by_sports():
    # Get the coach_id and selectedSport from the request parameters
    coach_id = request.args.get('coach_id')
    selected_sport = request.args.get('selectedSport')

    if coach_id is None or selected_sport is None:
        return jsonify(error="Missing coach_id or selectedSport parameter")

    # Query the database to get athletes associated with the specified coach_id
    athlete_membership_records = CoachAthleteMembership.query.filter_by(coach_id=coach_id).all()

    # Create a list to store the filtered athlete data
    filtered_athlete_list = []

    # Iterate through the athlete_membership_records and retrieve athlete details
    for record in athlete_membership_records:
        athlete = Athletes.query.get(record.athlete_id)
        if athlete and selected_sport in athlete.sports:
            athlete_data = {
                'athlete_id': athlete.athlete_id,
                'email': athlete.email,
                'name': athlete.name,
                'sports': athlete.sports,
                'institute': athlete.institute,
                'coach_id': coach_id
                # Add more fields as needed
            }
            filtered_athlete_list.append(athlete_data)

    # Return the filtered athlete data as JSON
    return jsonify(filtered_athletes=filtered_athlete_list)


@app.route('/getAthletesForAdmin', methods=['GET'])
def get_athletes_for_admin():
    try:
        # Query the Athletes table to get all athletes
        athletes = Athletes.query.all()

        # Initialize a list to store athlete data
        athlete_list = []

        for athlete in athletes:
            # Retrieve team memberships for the athlete
            team_memberships = TeamMemberships.query.filter_by(athlete_id=athlete.athlete_id).all()

            # Initialize a list to store team names for the athlete
            athlete_teams = []

            for membership in team_memberships:
                team = Teams.query.get(membership.team_id)
                if team:
                    athlete_teams.append(team.name)

            athlete_data = {
                'name': athlete.name,
                'phone': athlete.phone,
                'age': athlete.age,
                'gender': athlete.gender,
                'sports': athlete.sports,
                'institute': athlete.institute,
                'teams': athlete_teams,
                'email': athlete.email
            }

            athlete_list.append(athlete_data)

        return jsonify(athletes=athlete_list)

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/getAllTeams', methods=['GET'])
def get_all_teams():
    # Get the coach_id from the request query parameters
    coach_id = request.args.get('coach_id')

    if coach_id is None:
        return jsonify(error="Missing coach_id")

    # Query the database to get teams for the specified coach_id
    teams = Teams.query.filter_by(coach_id=coach_id).all()
    
    # Create a list to store the team data
    team_list = []

    # Iterate through the teams and convert them to dictionaries
    for team in teams:
        team_data = {
            'team_id': team.team_id,
            'name': team.name,
            'sports': team.sport,
            'coach_id': team.coach_id
            # Add more fields as needed
        }
        team_list.append(team_data)

    # Return the team data as JSON
    return jsonify(teams=team_list)

# Create a route to get an athlete's name by athlete_id
@app.route('/getAthleteName', methods=['GET'])
def get_athlete_name():
    athlete_id = request.args.get('athlete_id')
    if not athlete_id:
        return jsonify({'error': 'Missing athlete_id'}), 400

    athlete = Athletes.query.get(athlete_id)
    if athlete is not None:
        return jsonify({'athlete_name': athlete.name})
    else:
        return jsonify({'error': 'Athlete not found'}), 404
    

# Define a route to get blocks of exercises
from flask import Flask, request, jsonify
from datetime import datetime
from dateutil.parser import parse

# ... your existing code ...

# Define a route to get blocks of exercises
@app.route('/get_blocks', methods=['GET'])
def get_blocks():
    athlete_id = int(request.args.get('athleteId'))
    coach_id = int(request.args.get('coachId'))
    selected_date_str = request.args.get('selectedDate')

    # Parse the selected date into a datetime object
    selected_date = parse(selected_date_str).date()

    # Query the database to find the athlete-workout mappings based on athlete_id and coach_id
    athlete_workouts = AthleteWorkouts.query.filter_by(athlete_id=athlete_id).all()

    blocks = []

    for athlete_workout in athlete_workouts:
        workout = athlete_workout.workout

        if workout.date_added == selected_date:
            workout_blocks = workout.blocks

            for block in workout_blocks:
                block_exercises = block.exercises

                exercises_data = []

                for exercise in block_exercises:
                    exercise_data = {
                        "name": exercise.name,
                        "loads_reps": exercise.loads_reps,
                        "sets": exercise.sets
                    }
                    exercises_data.append(exercise_data)

                block_data = {
                    "id": block.block_id,
                    "name": block.name,
                    "exercises": exercises_data
                }
                blocks.append(block_data)

    print()
    print(blocks)
    print()
    return jsonify(blocks)


@app.route('/addCoachAthleteMembership', methods=['POST'])
def add_coach_athlete_membership():
    try:
        coach_id = request.json.get('coach_id')
        athlete_email = request.json.get('athlete_email')

        # Find the athlete_id associated with the provided athlete_email
        athlete = Athletes.query.filter_by(email=athlete_email).first()
        if not athlete:
            return jsonify({'error': 'Athlete not found for the given email'}), 404

        # Create a new coach-athlete relationship
        membership = CoachAthleteMembership(coach_id=coach_id, athlete_id=athlete.athlete_id)
        db.session.add(membership)
        db.session.commit()

        return jsonify({'message': 'Coach-Athlete membership added successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# Update coach profile endpoint
@app.route('/updateCoachProfile', methods=['POST'])
def update_coach_profile():
    if request.method == 'POST':
        # Get the coach's email from the session
        email = session.get('username')
        if email is None:
            return jsonify({'error': 'Coach not authenticated'}), 401
        
        # Retrieve the coach from the database
        coach = Coaches.query.filter(Coaches.email == email).first()
        if coach is None:
            return jsonify({'error': 'Coach not found'}), 404
        
        # Get the updated data from the POST request
        data = request.get_json()
        
        # Convert the list of sports to a string
        updated_sports = ",".join(data.get('sports'))
        
        # Update the coach's data, except for the email
        coach.name = data.get('name')
        coach.phone = data.get('phone')
        coach.sports = updated_sports
        coach.institute = data.get('institute')
        
        # Commit the changes to the database
        db.session.commit()
        
        return jsonify({'message': 'Coach profile updated successfully'})
    
# Route for updating the coach's password
@app.route('/updateCoachPassword', methods=['POST'])
def update_coach_password():
    if 'username' in session:
        data = request.get_json(force=True)
        coach = Coaches.query.filter_by(email=session['username']).first()
        
        if coach and bcrypt.check_password_hash(coach.password, data['oldPassword']):
            new_password = bcrypt.generate_password_hash(data['newPassword']).decode('utf-8')
            coach.password = new_password
            db.session.commit()
            return jsonify({'message': 'Password updated successfully'})
        else:
            return jsonify({'message': 'Invalid old password'}), 401
    else:
        return jsonify({'message': 'Unauthorized'}), 401
    
# Route for logging out
@app.route('/logout', methods=['POST'])
def logout():
    # Clear the session data
    session.clear()
    return jsonify(message='Logged out successfully')


# @app.route('/getBlocksByWorkout', methods=['GET'])
# def get_blocks_by_workout():
#     try:
#         workout_id = request.args.get('workoutId', type=int)

#         if workout_id is not None:
#             blocks = Blocks.query.filter_by(workout_id=workout_id).all()

#             block_list = []
#             for block in blocks:
#                 block_data = {
#                     'block_id': block.block_id,
#                     'name': block.name
#                 }
#                 block_list.append(block_data)

#             return jsonify(blocks=block_list), 200

#         return jsonify({'error': 'workoutId is required in the query parameters'}), 400

#     except Exception as e:
#         return jsonify({'error': str(e)}), 400


# New route
@app.route('/getBlocksByWorkout', methods=['GET'])
def get_blocks_by_workout():
    try:
        workout_id = request.args.get('workoutId', type=int)

        if workout_id is not None:
            blocks = Blocks.query.filter_by(workout_id=workout_id).all()

            blocks_list = []
            for block in blocks:
                block_data = {
                    'block_id': block.block_id,
                    'name': block.name,
                }
                blocks_list.append(block_data)

            return jsonify(blocks=blocks_list), 200

        return jsonify({'error': 'workoutId is required in the query parameters'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/getExercisesByBlock', methods=['GET'])
def get_exercises_by_block():
    try:
        block_id = request.args.get('blockId', type=int)

        if block_id is not None:
            exercises = Exercises.query.filter_by(block_id=block_id).all()

            exercise_list = []
            for exercise in exercises:
                exercise_data = {
                    'exercise_id': exercise.exercise_id,
                    'name': exercise.name,
                    'loads_reps': exercise.loads_reps,
                    'sets': exercise.sets
                }
                exercise_list.append(exercise_data)

            return jsonify(exercises=exercise_list), 200

        return jsonify({'error': 'blockId is required in the query parameters'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# get defined exercises
@app.route('/exercises', methods=['GET'])
def get_exercises():
    coach_id = request.args.get('coach_id')

    if coach_id is not None:
        # Use aliased to join CoachDefinedExercisesRelationship twice
        category_alias = aliased(CoachDefinedExercisesRelationship)

        exercises = (
            DefineExercise.query
            .join(ExerciseType, DefineExercise.type_id == ExerciseType.id)
            .join(Category, ExerciseType.category_id == Category.id)
            .join(CoachDefinedExercisesRelationship, Category.id == CoachDefinedExercisesRelationship.category_id)
            .join(category_alias, and_(
                CoachDefinedExercisesRelationship.category_id == category_alias.category_id,
                CoachDefinedExercisesRelationship.coach_id == int(coach_id)
            ))
            .all()
        )

        exercise_list = []

        for exercise in exercises:
            exercise_data = {
                'id': exercise.id,
                'name': exercise.name,
                'category': exercise.exercise_type.category.name,
                'exercise_type': exercise.exercise_type.name
            }
            exercise_list.append(exercise_data)

        return jsonify({'exercises': exercise_list})
    else:
        return jsonify({'error': 'coach_id is required for filtering exercises'}), 400


# deleting defined exercises
@app.route('/exercises/<int:exercise_id>', methods=['DELETE'])
def delete_exercise(exercise_id):
    try:
        # Fetch the exercise from the database
        exercise = DefineExercise.query.get(exercise_id)

        if exercise is not None:
            # Delete the exercise, and SQLAlchemy will automatically delete related records
            db.session.delete(exercise)
            db.session.commit()
            return jsonify({'message': 'Exercise and its references deleted successfully'}), 200
        else:
            return jsonify({'message': 'Exercise not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Adding new Category for defined exercises
@app.route('/add_category', methods=['POST'])
def add_category():
    try:
        # Get the category name and coach ID from the request
        category_name = request.json.get('name')
        coach_id = request.json.get('coachId')

        # Check if the category already exists for the specific coach
        existing_category = (
            Category.query
            .join(CoachDefinedExercisesRelationship, Category.id == CoachDefinedExercisesRelationship.category_id)
            .filter(Category.name == category_name, CoachDefinedExercisesRelationship.coach_id == coach_id)
            .first()
        )

        if existing_category:
            return jsonify({'message': 'Category already exists for the specific coach'}), 400

        # Create a new category
        new_category = Category(name=category_name)

        # Add the category to the database
        db.session.add(new_category)
        db.session.commit()

        # Create a new entry in CoachDefinedExercisesRelationship
        new_relationship = CoachDefinedExercisesRelationship(coach_id=coach_id, category_id=new_category.id)

        # Add the relationship to the database
        db.session.add(new_relationship)
        db.session.commit()

        return jsonify({'message': 'Category added successfully'}), 201

    except IntegrityError as e:
        # Handle the case where the category is added but the relationship entry fails
        db.session.rollback()
        return jsonify({'error': 'Failed to add the relationship entry'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Adding exercise-type for defined exercises
@app.route('/add_exercise_type', methods=['POST'])
def add_exercise_type():
    data = request.get_json()

    if 'name' not in data or 'category_id' not in data or 'coach_id' not in data:
        return jsonify({'error': 'Exercise type name, category ID, and coach ID are required'}), 400

    exercise_type_name = data['name']
    category_id = data['category_id']
    coach_id = data['coach_id']

    # Check if the category exists
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': 'Category does not exist'}), 400

    # Check if the exercise type already exists in the category
    existing_exercise_type_in_category = ExerciseType.query.filter_by(name=exercise_type_name, category=category).first()
    if existing_exercise_type_in_category:
        return jsonify({'error': 'Exercise type already exists in the category'}), 400

    # Check if the coach has a relationship with the category
    coach_category_relationship = CoachDefinedExercisesRelationship.query.filter_by(coach_id=coach_id, category_id=category_id).first()
    if not coach_category_relationship:
        return jsonify({'error': 'Coach does not have a relationship with the category'}), 400

    # Check if the coach already has the same exercise type across all categories
    existing_exercise_type_for_coach = (
        ExerciseType.query
        .join(Category, ExerciseType.category_id == Category.id)
        .join(CoachDefinedExercisesRelationship, Category.id == CoachDefinedExercisesRelationship.category_id)
        .filter(ExerciseType.name == exercise_type_name, CoachDefinedExercisesRelationship.coach_id == coach_id)
        .first()
    )
    if existing_exercise_type_for_coach:
        return jsonify({'error': 'Exercise type already exists for the coach across all categories of the Coach'}), 400

    # Create a new exercise type
    new_exercise_type = ExerciseType(name=exercise_type_name, category=category)

    try:
        db.session.add(new_exercise_type)
        db.session.commit()
        return jsonify({'message': 'Exercise type added successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error adding exercise type'}), 500


# API endpoint to get all categories
@app.route('/categories', methods=['GET'])
def get_categories():
    try:
        coach_id = request.args.get('coach_id')

        if coach_id is not None:
            # Use aliased to join CoachDefinedExercisesRelationship
            category_alias = aliased(CoachDefinedExercisesRelationship)

            # Fetch only those categories mapped to the specified coach_id
            categories = (
                Category.query
                .join(CoachDefinedExercisesRelationship, Category.id == CoachDefinedExercisesRelationship.category_id)
                .filter(CoachDefinedExercisesRelationship.coach_id == int(coach_id))
                .all()
            )

            categories_list = [{'id': category.id, 'name': category.name} for category in categories]
            return jsonify({'categories': categories_list})
        else:
            return jsonify({'error': 'coach_id is required for filtering categories'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# API endpoint to get all exercise types for a specific category
@app.route('/exercise-types', methods=['GET'])
def get_exercise_types():
    try:
        category_id = request.args.get('category_id')

        # Check if the category_id is provided
        if category_id is None:
            return jsonify({'error': 'Category ID is required'}), 400

        # Query the database to get exercise types for the specified category
        exercise_types = ExerciseType.query.filter_by(category_id=category_id).all()

        # Convert the SQLAlchemy objects to a list of dictionaries
        exercise_types_list = [{'id': exercise.id, 'name': exercise.name} for exercise in exercise_types]

        return jsonify({'exercise_types': exercise_types_list})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# API endpoint to get all exercises for a specific exercise type
@app.route('/getDefinedExercises', methods=['GET'])
def get_defined_exercises():
    try:
        exercise_type_id = request.args.get('exercise_type_id')

        # Check if the exercise_type_id is provided
        if exercise_type_id is None:
            return jsonify({'error': 'Exercise Type ID is required'}), 400

        # Query the database to get exercises for the specified exercise type
        exercises = DefineExercise.query.filter_by(type_id=exercise_type_id).all()

        # Convert the SQLAlchemy objects to a list of dictionaries
        exercises_list = [{'id': exercise.id, 'name': exercise.name} for exercise in exercises]

        return jsonify({'exercises': exercises_list})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# API endpoint to add a new exercise to DefineExercise (coach defined exercises)
@app.route('/add-exercise', methods=['POST'])
def add_defined_exercise():
    try:
        data = request.get_json()
        name = data.get('name')
        type_id = data.get('type_id')
        coach_id = data.get('coach_id')  # Add coach_id to the data

        # Validate and add the exercise to the database
        if not name or not type_id or not coach_id:
            return jsonify({'error': 'Name, type_id, and coach_id are required parameters'}), 400
        
        # Check if the exercise already exists in the same category and exercise type for the coach
        existing_exercise_in_same_category_type = (
            DefineExercise.query
            .join(ExerciseType, DefineExercise.type_id == ExerciseType.id)
            .join(CoachDefinedExercisesRelationship, ExerciseType.category_id == CoachDefinedExercisesRelationship.category_id)
            .filter(DefineExercise.name == name, ExerciseType.id == type_id, CoachDefinedExercisesRelationship.coach_id == coach_id)
            .first()
        )

        if existing_exercise_in_same_category_type:
            return jsonify({'error': 'Exercise with the given name already exists in the same category and exercise type for the coach'}), 400

        # Check if the exercise with the given name and coach_id already exists
        existing_exercise = (
            DefineExercise.query
            .join(ExerciseType, DefineExercise.type_id == ExerciseType.id)
            .join(Category, ExerciseType.category_id == Category.id)
            .join(CoachDefinedExercisesRelationship, Category.id == CoachDefinedExercisesRelationship.category_id)
            .filter(DefineExercise.name == name, CoachDefinedExercisesRelationship.coach_id == coach_id)
            .first()
        )

        if existing_exercise:
            return jsonify({'error': 'Exercise with the given name already exists for a category for the coach'}), 400

        # Create an instance of DefineExercise
        exercise = DefineExercise(name=name, type_id=type_id)

        # Check if the ExerciseType with the given type_id exists
        exercise_type = ExerciseType.query.get(type_id)
        if not exercise_type:
            return jsonify({'error': 'ExerciseType with the given type_id does not exist'}), 404

        # Check if the Category with the given category_id exists
        category_id = exercise_type.category_id
        category = Category.query.get(category_id)
        if not category:
            return jsonify({'error': 'Category with the given category_id does not exist'}), 404

        # Add the exercise to the database
        db.session.add(exercise)
        db.session.commit()

        return jsonify({'message': 'Exercise added successfully!'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# API endpoint to update an existing exercise in DefineExercise
@app.route('/update-exercise/<int:exercise_id>', methods=['PUT'])
def update_defined_exercise(exercise_id):
    try:
        data = request.get_json()
        name = data.get('name')
        type_id = data.get('type_id')

        # Validate and update the exercise in the database
        if not name or not type_id:
            return jsonify({'error': 'Name and type_id are required parameters'}), 400

        # Check if the exercise with the given exercise_id exists
        exercise = DefineExercise.query.get(exercise_id)
        if not exercise:
            return jsonify({'error': 'Exercise with the given exercise_id does not exist'}), 404

        # Update exercise details
        exercise.name = name
        exercise.type_id = type_id

        # Check if the ExerciseType with the given type_id exists
        exercise_type = ExerciseType.query.get(type_id)
        if not exercise_type:
            return jsonify({'error': 'ExerciseType with the given type_id does not exist'}), 404

        # Check if the Category with the given category_id exists
        category_id = exercise_type.category_id
        category = Category.query.get(category_id)
        if not category:
            return jsonify({'error': 'Category with the given category_id does not exist'}), 404

        # Commit changes to the database
        db.session.commit()

        return jsonify({'message': 'Exercise updated successfully!'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API to render the getExercise name
@app.route('/getExerciseName')
def getExerciseName():
    return render_template('add-exercise-form.html')


# Get Exercise Details by exercise ID
@app.route('/getExerciseDetails', methods=['GET'])
def get_exercises_details():
    try:
        exercise_id = request.args.get('exerciseId', type=int)

        if exercise_id is not None:
            exercise = Exercises.query.filter_by(exercise_id=exercise_id).first()

        if exercise:
            exercise_detail = {
                    'exercise_id': exercise.exercise_id,
                    'name': exercise.name,
                    'loads_reps': exercise.loads_reps,
                    'sets': exercise.sets
                }
            print(exercise_detail)
            return jsonify([exercise_detail]), 200

        return jsonify({'error': 'exerciseId is required in the query parameters'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Athlete User input processing
@app.route('/postAthleteInputs', methods=["POST"])
def save_athlete_inputs():
    # Check if its a team workout or its an athlete Workout
    athlete_exercise_input = request.json

    # If its a team workout assignment, create the record for 
    athlete_id = athlete_exercise_input.get('athlete_id')
    exercise_id = athlete_exercise_input.get('exercise_id')
    input_load = athlete_exercise_input.get('input_load')
    date = athlete_exercise_input.get('date')

    if athlete_id is None :
        return jsonify({'error': 'athleteId is required '}), 400
        
    if exercise_id is None :
         return jsonify({'error': 'exerciseId  is required '}), 400

    exercise = Exercises.query.filter_by(exercise_id=exercise_id).first()
    athlete = Athletes.query.filter_by(athlete_id=athlete_id).first()

    if exercise and athlete:
        # Check athleteinput for exericse is  existing ? UPDATE : INSERT
        exercise_input_present = AthleteExerciseInputLoads.query.filter_by(exercise_id=exercise_id,athlete_id=athlete_id).first()

        # Create the exercise in the AthleteExerciseInputLoads table
        if exercise_input_present :
            # Update the same value in the database
            exercise_input_present.input_load = input_load
            exercise_input_present.exercise_completed_date = date
            db.session.commit()
        else:
            athlete_exercise = AthleteExerciseInputLoads(athlete_id=athlete_id,exercise_id=exercise_id,input_load=input_load,exercise_completed_date=date)
            db.session.add(athlete_exercise)
            db.session.commit()

        return jsonify({"success":"Input Load Saved successfully"}),200
    
    return jsonify({'error':"This Exercise is non existent"}) , 400

# Assuming  User input in AthleteExerciseInputLoads exists
@app.route('/showAthleteExerciseInputLoads', methods=["GET"])
def check_athlete_exercise_input_loads():
    # Pass the exercise id
    exercise_id =  request.args.get('exerciseId')
    athlete_id = request.args.get('athleteId')

    if athlete_id is None :
            return jsonify({'error': 'athleteId is required '}), 400
            
    if exercise_id is None :
            return jsonify({'error': 'exerciseId  is required '}), 400

    exercise = Exercises.query.filter_by(exercise_id=exercise_id).first()
    athlete = Athletes.query.filter_by(athlete_id=athlete_id).first()

    if exercise and athlete:
        athlete_input = AthleteExerciseInputLoads.query.filter_by(exercise_id=exercise_id, athlete_id=athlete_id).first()

        if athlete_input:
            # Send back the input_loads
            athlete_exercise_input = {
                'load_id': athlete_input.load_id,
                'input_load': athlete_input.input_load,
                'exercise_completed_date':athlete_input.exercise_completed_date,
            }
            return jsonify(athlete_exercise_input) , 200
        
    return jsonify({'info':'No exercise input found'}) , 200

@app.route('/notesLanding')
def notesLanding():
    return render_template('coachNotes_landing.html')


@app.route('/getAllSports', methods=['GET'])
def get_all_sports():
    try:
        # Query the database to retrieve all sports
        sports = Sports.query.all()

        # Create a list to store the sport names
        sport_list = [sport.name for sport in sports]

        return jsonify(sports=sport_list)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/getAllInstitutes', methods=['GET'])
def get_all_institutes():
    try:
        # Query the database to retrieve all institutes
        institutes = Institutes.query.all()

        # Create a list to store the institute names
        institute_list = [institute.name for institute in institutes]

        return jsonify(institutes=institute_list)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/addSport', methods=['POST'])
def add_sport():
    try:
        # Get the sport name from the request JSON
        sport_name = request.json.get('name')

        # Create a new Sport instance and add it to the database
        new_sport = Sports(name=sport_name)
        db.session.add(new_sport)
        db.session.commit()

        return jsonify({'message': 'Sport added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/addInstitute', methods=['POST'])
def add_institute():
    try:
        # Get the institute name from the request JSON
        institute_name = request.json.get('name')

        # Create a new Institute instance and add it to the database
        new_institute = Institutes(name=institute_name)
        db.session.add(new_institute)
        db.session.commit()

        return jsonify({'message': 'Institute added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/updateAthlete', methods=['POST'])
def update_athlete():
    try:
        # Parse the JSON data from the request
        data = request.json
        # Retrieve athlete data from the request or database
        email=data['email']
        updated_phone = data['phone']
        updated_sports = data['sports']
        updated_institute = data['institute']
        
        # Retrieve the athlete from the database
        athlete = Athletes.query.filter_by(email=email).first()

        if not athlete:
            return jsonify({'error': 'Athlete not found'}), 404
        # Update athlete information
        athlete.phone = updated_phone
        athlete.sports = updated_sports
        athlete.institute = updated_institute

        # Commit the changes to the database
        db.session.commit()

        return jsonify({'message': 'Athlete updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/updateCoachesinAdmin', methods=['POST'])
def update_coaches_in_admin():
    try:
        # Parse the JSON data from the request
        data = request.json
        # Retrieve athlete data from the request or database
        email=data['email']
        updated_phone = data['phone']
        updated_sports = data['sports']
        updated_institute = data['institute']
        
        # Retrieve the athlete from the database
        coach = Coaches.query.filter_by(email=email).first()

        if not coach:
            return jsonify({'error': 'Athlete not found'}), 404
        # Update athlete information
        coach.phone = updated_phone
        coach.sports = updated_sports
        coach.institute = updated_institute

        # Commit the changes to the database
        db.session.commit()

        return jsonify({'message': 'Coach updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/logoutAdmin')
def logout_admin():
    # Clear the session to log the user out
    session.pop('username', None)
    return redirect(url_for('admin_login'))


# route for athlete Profile
@app.route('/get_athlete_data', methods=['GET'])
def get_athlete_data():
    athlete_email = request.args.get('email')

    # Query the database to get athlete data based on the email
    athlete = Athletes.query.filter_by(email=athlete_email).first()

    if athlete:
        # Convert athlete data to a dictionary
        athlete_data = {
            'athlete_id': athlete.athlete_id,
            'name': athlete.name,
            'age': athlete.age,
            'email': athlete.email,
            'phone': athlete.phone,
            'sports': athlete.sports,  
            'gender': athlete.gender,
            'institute': athlete.institute
        }

        return jsonify(athlete_data)
    else:
        return jsonify({'error': 'Athlete not found'}), 404
    
@app.route('/update_athlete_profile', methods=['POST'])
def update_athlete_profile():
    try:
        data = request.get_json()
        athlete_email = data.get('email')

        # Query the database to get the athlete based on the email
        athlete = Athletes.query.filter_by(email=athlete_email).first()

        if athlete:
            # Update athlete data with the new values
            athlete.name = data.get('name')
            athlete.age = data.get('age')
            athlete.phone = data.get('phone')
            athlete.gender = data.get('gender')
            athlete.sports = ','.join(data.get('sports')) 
            athlete.institute = data.get('institute')

            # Commit the changes to the database
            db.session.commit()

            return jsonify({'message': 'Athlete profile updated successfully'})
        else:
            return jsonify({'error': 'Athlete not found'}), 404

    except Exception as e:
        return jsonify({'error': f'Error updating athlete profile: {str(e)}'}), 500
    
# Route for updating the coach's password
@app.route('/updateAthletePassword', methods=['POST'])
def update_athlete_password():
    if 'username' in session:
        data = request.get_json(force=True)
        athlete = Athletes.query.filter_by(email=session['username']).first()
        
        if athlete and bcrypt.check_password_hash(athlete.password, data['oldPassword']):
            new_password = bcrypt.generate_password_hash(data['newPassword']).decode('utf-8')
            athlete.password = new_password
            db.session.commit()
            return jsonify({'message': 'Password updated successfully'})
        else:
            return jsonify({'message': 'Invalid old password'}), 401
    else:
        return jsonify({'message': 'Unauthorized'}), 401

# Now I am adding this to retrieve coachname using coach_id
@app.route('/getCoachNameById', methods=['GET'])
def get_coach_name_by_id():
    coach_id = request.args.get('coachId')  # Assuming the ID is passed as a query parameter

    if coach_id:
        coach = Coaches.query.filter_by(coach_id=coach_id).first()
        if coach:
            return jsonify({'name': coach.name})
        else:
            return jsonify({'error': 'Coach not found'}), 404
    else:
        return jsonify({'error': 'No coach ID provided'}), 400


@app.route('/notes_athlete')
def athleteNotes():
    return render_template('athleteNotes.html')


@app.route('/getAthleteById', methods=['GET'])
def get_athlete_by_id():
    athlete_id = request.args.get('athlete_id')  # Get the athlete_id from the request arguments
    if athlete_id is not None:
        athlete = Athletes.query.filter_by(athlete_id=athlete_id).first()  # Query the athlete details
        if athlete:
            # Query the team for the athlete based on TeamMemberships
            team_membership = TeamMemberships.query.filter_by(athlete_id=athlete.athlete_id).first()
            if team_membership:
                team = Teams.query.get(team_membership.team_id)
                team_name = team.name
            else:
                team_name = None

            # Extract the required details from the athlete object
            athlete_details = {
                'athlete_id': athlete.athlete_id,
                'name': athlete.name,
                'institute': athlete.institute,
                'sports': athlete.sports,
                'team': team_name
            }
            return jsonify(athlete_details)
        else:
            return jsonify({'error': 'Athlete not found'}), 404
    else:
        return jsonify({'error': 'Athlete ID not provided'}), 400

    
@app.route('/adminNotifications')
def adminNotifications():
    return render_template('admin_notifications.html')



#Adding athlete notifications on admin side 
@app.route('/postAthletesNotification', methods=['POST'])
def post_athletes_notification():
    data = request.get_json(force=True)
    name = data.get('name')
    email = data.get('email')
    sports = data.get('sports')
    institute = data.get('institute')
    date_created=data.get('date_created')

    # Create a new notification
    new_notification = AdminAthleteNotifications(
        name=name,
        email=email,
        sports=sports,
        institute=institute,
        date_created=date_created,
        flag="unopened"
    )

    db.session.add(new_notification)
    db.session.commit()
    methods.send_welcome_email(name, email, "athlete")
    return jsonify({"message": "Notification for athlete registration created successfully."})

@app.route('/getAthletesNotifications', methods=['GET'])
def get_athletes_notifications():
    # Fetching all notifications from the database
    notifications = AdminAthleteNotifications.query.order_by(AdminAthleteNotifications.date_created.desc(), AdminAthleteNotifications.notification_id.desc()).all()
    notifications_list = []

    for notification in notifications:
        notification_data = {
            'notification_id': notification.notification_id,
            'name': notification.name,
            'email': notification.email,
            'sports': notification.sports,
            'institute': notification.institute,
            'date_created': notification.date_created.strftime("%Y-%m-%d"),  # Formatting the date
            'flag': notification.flag
        }
        notifications_list.append(notification_data)

    return jsonify(notifications_list)

@app.route('/updateAthleteNotification/<notification_id>', methods=['PUT'])
def update_athlete_notification(notification_id):
    # Find the athlete notification by ID
    notification = AdminAthleteNotifications.query.get(notification_id)

    # Check if the notification exists
    if notification:
        # Update the flag to 'opened'
        notification.flag = 'opened'

        # Commit changes to the database
        db.session.commit()

        return jsonify({"message": "Athlete notification status updated successfully."}), 200
    else:
        return jsonify({"message": "Athlete notification not found."}), 404
    
@app.route('/postCoachNotification', methods=['POST'])
def post_coach_notification():
        data = request.get_json(force=True)
        name = data.get('name')
        email = data.get('email')
        sports = data.get('sports')
        institute = data.get('institute')
        date_created=data.get('date_created')

        # Create a new notification
        new_notification = AdminCoachNotifications(
            name=name,
            email=email,
            sports=sports,
            institute=institute,
            date_created=date_created,
            flag="unopened"
        )

        db.session.add(new_notification)
        db.session.commit()
        methods.send_welcome_email(name, email, "coach")
        return jsonify({"message": "Notification for athlete registration created successfully."})

@app.route('/updateNotification/<notification_id>', methods=['PUT'])
def update_notification(notification_id):
    # Find the notification by ID
    notification = AdminCoachNotifications.query.get(notification_id)

    # Check if notification exists
    if notification:
        # Update the flag to 'opened'
        notification.flag = 'opened'

        # Commit changes to the database
        db.session.commit()

        return jsonify({"message": "Notification status updated successfully."}), 200
    else:
        return jsonify({"message": "Notification not found."}), 404
    
@app.route('/getNotifications', methods=['GET'])
def get_notifications():
    # Query all notifications
    notifications = AdminCoachNotifications.query.order_by(AdminCoachNotifications.date_created.desc(), AdminCoachNotifications.notification_id.desc()).all()

    # Convert notifications to a list of dictionaries to make them JSON serializable
    notifications_list = []
    for notification in notifications:
        notification_data = {
            "notification_id": notification.notification_id,  # Corrected attribute name
            "name": notification.name,
            "email": notification.email,
            "sports": notification.sports,
            "institute": notification.institute,
            "date_created": notification.date_created.strftime("%Y-%m-%d"),  # formatting date
            "flag": notification.flag
        }
        notifications_list.append(notification_data)

    return jsonify(notifications_list)
# API endpoint for coach to edit athlete details
@app.route('/editAthleteDetails')
def editAthleteDetails():
    return render_template('edit-athlete-details.html')

# API endpoint for coach to add new athlete
@app.route('/addNewAthlete')
def addNewAthlete():
    return render_template('coach-add-new-athlete.html')





@app.route('/coachhNotifications')
def coachhNotifications():
    return render_template('coach_notifications.html')



@app.route('/athleteeNotifications')
def athleteeNotifications():
    return render_template('athlete_notifications.html')


# For adding a workout and assiging to the athletes/teams
@app.route('/addWorkoutAndAssign', methods=['POST'])
def add_workout_and_assign():
    try:
        data = request.get_json()
        name =  data['name']
        athlete_id = data.get('athlete_id')
        if athlete_id:
            athlete_id = int(athlete_id)

        team_id = data.get('team_id')
        if team_id:
            team_id = int(team_id)


        if not team_id and not athlete_id:
            return jsonify({"error": "Please provide the athleteId or teamId"}), 404
        

        coach_id = int(data['coach_id']) 
        date_added = data['date_added']


        if date_added is None or coach_id is None :
            return jsonify({"error": "Please provide the date and coachId"}), 404
        else:
            date_added = datetime.strptime(date_added, '%Y-%m-%d').date()


        if data['athlete_id'] :
            workouts = Workouts.query.filter_by(name=name, coach_id=coach_id, date_added=date_added)
            workouts = workouts.join(AthleteWorkouts,AthleteWorkouts.workout_id == Workouts.workout_id).filter_by(athlete_id=athlete_id).all()
            print("Workouts", workouts)

            if workouts:
                return jsonify({'workoutExists': 'You cannot add Workouts'}), 200
            else:
                # Add the workout
                print("You can add workouts now")
                
                # Now add the workouts
                new_workout = Workouts(name=data['name'], coach_id=data['coach_id'],date_added=date_added)
                db.session.add(new_workout)
                db.session.commit()

                athlete_workout = AthleteWorkouts(
                    athlete_id=data['athlete_id'],
                    workout_id=new_workout.workout_id,
                )
                db.session.add(athlete_workout)
        #  time.sleep(3) 
                blocks = []
                # print(workout_data)
                blocks = data.get("blocks") 
                print(blocks)
                for block in blocks:
                    block_data = {
                        'name': block["name"],
                        'workout_id': new_workout.workout_id,
                        'exercises' : block["exercises"]
                    }

                    new_block = Blocks(name=block_data["name"], workout_id=block_data["workout_id"])
                    db.session.add(new_block)
                    db.session.commit()

                    for exercise in block_data["exercises"]:
                        exercise_data = {
                            'name': exercise["name"],
                            'loads_reps': exercise["loads_reps"],
                            'sets': exercise["sets"],
                            'block_id':new_block.block_id,
                        }

                        new_exercise = Exercises(name=exercise_data["name"], loads_reps=exercise_data["loads_reps"], sets=exercise_data["sets"], block_id=exercise_data["block_id"])
                        db.session.add(new_exercise)
                        db.session.commit()
                    
                #return jsonify({"Success": "Workout Added Successfully"})
                return jsonify({"Success": "Workout Added Successfully to athlete", "workout_id" : f"{new_workout.workout_id}"})
            
        elif data['team_id']:
            workouts = Workouts.query.filter_by(name=name, coach_id=coach_id, date_added=date_added)
            workouts = workouts.join(TeamWorkoutsAssignments,TeamWorkoutsAssignments.workout_id == Workouts.workout_id).filter_by(team_id=team_id).all()
            print("Workouts", workouts)

            if workouts:
                return jsonify({'workoutExists': 'You cannot add Workouts'}), 200
            else:
                # Add the workout
                print("You can add workouts now")

                new_workout = Workouts(name=data['name'], coach_id=data['coach_id'],date_added=date_added)
                db.session.add(new_workout)
                db.session.commit()

                team_workout_assignment = TeamWorkoutsAssignments(
                    team_id=data['team_id'],
                    workout_id=new_workout.workout_id
                )
                db.session.add(team_workout_assignment)


                # time.sleep(3) 
                blocks = []
                # print(workout_data)
                blocks = data.get("blocks") 
                print(blocks)
                for block in blocks:
                    block_data = {
                        'name': block["name"],
                        'workout_id': new_workout.workout_id,
                        'exercises' : block["exercises"]
                    }

                    new_block = Blocks(name=block_data["name"], workout_id=block_data["workout_id"])
                    db.session.add(new_block)
                    db.session.commit()

                    for exercise in block_data["exercises"]:
                        exercise_data = {
                            'name': exercise["name"],
                            'loads_reps': exercise["loads_reps"],
                            'sets': exercise["sets"],
                            'block_id':new_block.block_id,
                        }

                        new_exercise = Exercises(name=exercise_data["name"], loads_reps=exercise_data["loads_reps"], sets=exercise_data["sets"], block_id=exercise_data["block_id"])
                        db.session.add(new_exercise)
                        db.session.commit()
                 
                # return jsonify({"Success": "Workout Added Successfully"})
                return jsonify({"Success": "Workout Added Successfully to team", "workout_id" : f"{new_workout.workout_id}"})
                # Update Athlete workouts Table
    except Exception as e:
        return jsonify({'error': f'Error Observed : {str(e)}'}), 500   
    

# API endpoint to delete Coach Athlete Membership
@app.route('/deleteCoachAthleteMembership/<int:athlete_id>', methods=['DELETE'])
def delete_coach_athlete_membership(athlete_id):
    try:
        if athlete_id is not None:
            # Find the athlete by athlete_id
            athlete = Athletes.query.filter_by(athlete_id=athlete_id).first()

            if athlete:
                # Find the CoachAthleteMembership entry
                membership_entry = CoachAthleteMembership.query.filter_by(athlete_id=athlete_id).first()

                if membership_entry:
                    # Delete the CoachAthleteMembership entry
                    db.session.delete(membership_entry)
                    db.session.commit()

                    return jsonify({'message': 'Athlete membership deleted successfully'}), 200
                else:
                    return jsonify({'error': 'Athlete membership not found'}), 404
            else:
                return jsonify({'error': 'Athlete not found'}), 404
        else:
            return jsonify({'error': 'athlete_id is required for deleting an athlete membership'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/hoverForCoaches', methods=['GET'])
def hover_for_coaches():
    try:
        coach_id = request.args.get('coachId', type=int)
        date_str = request.args.get('dateParam')

        # Parse the date string to a datetime object
        date = datetime.strptime(date_str, '%Y-%m-%d').date()

        # Query workouts for the specified coach and date
        workouts = Workouts.query.filter_by(coach_id=coach_id, date_added=date).all()
        tests_workouts = TestsWorkouts.query.filter_by(coach_id=coach_id, date_added=date).all()

        assignments = []

        for workout in workouts:
            workout_id = workout.workout_id
            workout_name = workout.name

            # Check if the workout is assigned to teams
            team_assignments = TeamWorkoutsAssignments.query.filter_by(workout_id=workout_id).all()

            for team_assignment in team_assignments:
                team_id = team_assignment.team_id
                team_name = Teams.query.get(team_id).name
                assignments.append({'workout_name': workout_name, 'assignment_type': 'team', 'assignment_name': team_name})

            # Check if the workout is assigned to athletes
            athlete_assignments = AthleteWorkouts.query.filter_by(workout_id=workout_id).all()

            for athlete_assignment in athlete_assignments:
                athlete_id = athlete_assignment.athlete_id
                athlete_name = Athletes.query.get(athlete_id).name
                assignments.append({'workout_name': workout_name, 'assignment_type': 'athlete', 'assignment_name': athlete_name})

        for tests_workout in tests_workouts:
            test_workout_id = tests_workout.test_workout_id
            test_workout_name = tests_workout.name

            # Check if the workout is assigned to teams
            tests_team_assignments = TestsTeamWorkoutsAssignments.query.filter_by(test_workout_id=test_workout_id).all()

            for tests_team_assignment in tests_team_assignments:
                team_id = tests_team_assignment.team_id
                team_name = Teams.query.get(team_id).name
                assignments.append({'test_name': test_workout_name, 'assignment_type': 'team', 'assignment_name': team_name})

            # Check if the workout is assigned to athletes
            tests_athlete_assignments = TestsAthleteWorkouts.query.filter_by(test_workout_id=test_workout_id).all()

            for tests_athlete_assignment in tests_athlete_assignments:
                athlete_id = tests_athlete_assignment.athlete_id
                athlete_name = Athletes.query.get(athlete_id).name
                assignments.append({'test_name': test_workout_name, 'assignment_type': 'athlete', 'assignment_name': athlete_name})


        return jsonify(assignments)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Render template for coach selection
@app.route('/coachSelection')
def coachSelection():
    return render_template('coach-datatable.html')

#Route for succesful athlete login and landing page
@app.route('/adminMultiCoachExercises')
def admin_multi_coach_exercises():
    if 'username' in session:
        return render_template("admin-multi-coach-exercises.html")
    else:
        return redirect(url_for('admin_login')) 
    

# # Route to get selected coaches
# @app.route('/getSelectedCoaches', methods=['GET'])
# def get_selected_coaches():
#     coach_ids_param = request.args.get('coachIds')

#     if not coach_ids_param:
#         return jsonify({'error': 'coach_ids parameter is required'}), 400

#     coach_ids = coach_ids_param.split(',')

#     coaches = Coaches.query.filter(Coaches.coach_id.in_(coach_ids)).all()

#     if not coaches:
#         return jsonify({'error': 'No coaches found with the given IDs'}), 404

#     coach_list = []
#     for coach in coaches:
#         coach_data = {
#             'coach_id': coach.coach_id,
#             'name': coach.name,
#             'email': coach.email,
#             'phone': coach.phone,
#             'sports': coach.sports,
#             'institute': coach.institute
#         }
#         coach_list.append(coach_data)

#     return jsonify(coaches=coach_list)


# get defined exercises for coaches
@app.route('/getExercisesForSelectedCoaches', methods=['GET'])
def get_exercises_for_coaches():
    coach_id_param = request.args.get('coach_id')

    if coach_id_param:
        coach_ids = coach_id_param.split(',')

        # Convert the string IDs to integers
        try:
            coach_ids = list(map(int, coach_ids))
        except ValueError:
            return jsonify({'error': 'Invalid coach_id format'}), 400

        exercises = (
            db.session.query(DefineExercise, ExerciseType, Category, Coaches)
            .join(ExerciseType, DefineExercise.type_id == ExerciseType.id)
            .join(Category, ExerciseType.category_id == Category.id)
            .join(CoachDefinedExercisesRelationship, Category.id == CoachDefinedExercisesRelationship.category_id)
            .join(Coaches, CoachDefinedExercisesRelationship.coach_id == Coaches.coach_id)
            .filter(CoachDefinedExercisesRelationship.coach_id.in_(coach_ids))
            .all()
        )

        exercise_list = []

        for define_exercise, exercise_type, category, coach in exercises:
            exercise_data = {
                'id': define_exercise.id,
                'name': define_exercise.name,
                'category': exercise_type.category.name,
                'exercise_type': exercise_type.name,
                'coach_name': coach.name,
                'coach_id': coach.coach_id
            }
            exercise_list.append(exercise_data)

        return jsonify({'exercises': exercise_list})
    else:
        return jsonify({'error': 'coach_id is required for filtering exercises'}), 400
    

# Adding new Category for defined exercises for multiple coaches
@app.route('/add_category_for_coaches', methods=['POST'])
def add_category_for_coaches():
    try:
        # Get the category name and coach IDs from the request
        category_name = request.json.get('name')
        coach_ids = request.json.get('coachIds')

        # Split the comma-separated coachIds into a list of integers
        coach_ids = [int(coach_id) for coach_id in coach_ids]


        # Check if the category already exists for any of the specified coaches
        existing_categories = (
            Category.query
            .join(CoachDefinedExercisesRelationship, Category.id == CoachDefinedExercisesRelationship.category_id)
            .filter(Category.name == category_name, CoachDefinedExercisesRelationship.coach_id.in_(coach_ids))
            .all()
        )

        if existing_categories:
            existing_coach_ids = [relation.coach_id for relation in existing_categories]
            return jsonify({'message': f'Category already exists for coach IDs: {existing_coach_ids}'}), 400

        # Create a new category for each coach
        new_category = Category(name=category_name)
        
        # Add the category to the database
        db.session.add(new_category)
        db.session.commit()

        # Create new entries in CoachDefinedExercisesRelationship for each coach
        for coach_id in coach_ids:
            # Create a new entry in CoachDefinedExercisesRelationship
            new_relationship = CoachDefinedExercisesRelationship(coach_id=coach_id, category_id=new_category.id)
            db.session.add(new_relationship)

        # Commit all changes to the database after the loop
        db.session.commit()

        return jsonify({'message': 'Category added successfully for all coaches'}), 201

    except IntegrityError as e:
        # Handle the case where the category is added but the relationship entry fails
        db.session.rollback()
        return jsonify({'error': 'Failed to add the relationship entry'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


from sqlalchemy import func

# API endpoint to get common categories for multiple coachIds
@app.route('/common_categories', methods=['GET'])
def get_common_categories():
    try:
        coach_ids_str = request.args.get('coach_ids')

        if coach_ids_str is not None:
            # Convert comma-separated string of coachIds to a list of integers
            coach_ids = [int(coach_id) for coach_id in coach_ids_str.split(',')]

            if len(coach_ids) < 2:
                return jsonify({'error': 'At least two coachIds are required for finding common categories'}), 400

            # Use aliased to join CoachDefinedExercisesRelationship
            category_alias = aliased(CoachDefinedExercisesRelationship)

            # Fetch categories common to all specified coachIds
            categories = (
                Category.query
                .join(CoachDefinedExercisesRelationship, Category.id == CoachDefinedExercisesRelationship.category_id)
                .filter(CoachDefinedExercisesRelationship.coach_id.in_(coach_ids))
                .group_by(Category.id)
                .having(func.count(CoachDefinedExercisesRelationship.coach_id.distinct()) == len(coach_ids))
                .all()
            )

            categories_list = [{'id': category.id, 'name': category.name} for category in categories]

            return jsonify({'common_categories': categories_list})
        else:
            return jsonify({'error': 'coach_ids parameter is required for filtering common categories'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Adding exercise-type for defined exercises for multiple coaches
@app.route('/add_exercise_type_multiple_coaches', methods=['POST'])
def add_exercise_type_multiple_coaches():
    data = request.get_json()

    if 'name' not in data or 'category_id' not in data or 'coach_ids' not in data:
        return jsonify({'error': 'Exercise type name, category ID, and coach IDs are required'}), 400

    exercise_type_name = data['name']
    category_id = data['category_id']
    coach_ids = [int(coach_id) for coach_id in data['coach_ids']]

    # Check if the category exists
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': 'Category does not exist'}), 400

    # Check if the exercise type already exists in the category
    existing_exercise_type_in_category = ExerciseType.query.filter_by(name=exercise_type_name, category=category).first()
    if existing_exercise_type_in_category:
        return jsonify({'error': 'Exercise type already exists in the category'}), 400

    # Check if the exercise type already exists for all coaches across all categories
    existing_exercise_type_for_coaches = (
        ExerciseType.query
        .join(Category, ExerciseType.category_id == Category.id)
        .join(CoachDefinedExercisesRelationship, Category.id == CoachDefinedExercisesRelationship.category_id)
        .filter(ExerciseType.name == exercise_type_name, CoachDefinedExercisesRelationship.coach_id.in_(coach_ids))
        .group_by(ExerciseType.id)
        .having(func.count(CoachDefinedExercisesRelationship.coach_id.distinct()) == len(coach_ids))
        .first()
    )
    if existing_exercise_type_for_coaches:
        return jsonify({'error': 'Exercise type already exists for all specified coaches across all categories'}), 400

    # Check if all coaches have a relationship with the category
    for coach_id in coach_ids:
        coach_category_relationship = CoachDefinedExercisesRelationship.query.filter_by(coach_id=coach_id, category_id=category_id).first()
        if not coach_category_relationship:
            return jsonify({'error': f'Coach {coach_id} does not have a relationship with the category'}), 400

    # Create a new exercise type
    new_exercise_type = ExerciseType(name=exercise_type_name, category=category)

    try:
        db.session.add(new_exercise_type)
        db.session.commit()
        return jsonify({'message': 'Exercise type added successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error adding exercise type'}), 500


# API endpoint to add a new exercise to DefineExercise (coach defined exercises) for multiple coaches
@app.route('/add-exercise-multiple-coaches', methods=['POST'])
def add_defined_exercise_multiple_coaches():
    try:
        data = request.get_json()
        name = data.get('name')
        type_id = data.get('type_id')
        coach_ids = [int(coach_id) for coach_id in data['coach_ids']]

        print(data)

        # Validate and add the exercise to the database
        if not name or not type_id or not coach_ids:
            return jsonify({'error': 'Name, type_id, and coach_ids are required parameters'}), 400

        # Check if the exercise already exists in the same category and exercise type for all coaches
        existing_exercise_in_same_category_type_for_coaches = (
            DefineExercise.query
            .join(ExerciseType, DefineExercise.type_id == ExerciseType.id)
            .join(CoachDefinedExercisesRelationship, ExerciseType.category_id == CoachDefinedExercisesRelationship.category_id)
            .filter(DefineExercise.name == name, ExerciseType.id == type_id, CoachDefinedExercisesRelationship.coach_id.in_(coach_ids))
            .group_by(DefineExercise.id)
            .having(func.count(CoachDefinedExercisesRelationship.coach_id.distinct()) == len(coach_ids))
            .first()
        )

        if existing_exercise_in_same_category_type_for_coaches:
            return jsonify({'error': 'Exercise with the given name already exists in the same category and exercise type for all specified coaches'}), 400

        # Check if the exercise with the given name and coach_ids already exists for all coaches
        existing_exercise_for_coaches = (
            DefineExercise.query
            .join(ExerciseType, DefineExercise.type_id == ExerciseType.id)
            .join(Category, ExerciseType.category_id == Category.id)
            .join(CoachDefinedExercisesRelationship, Category.id == CoachDefinedExercisesRelationship.category_id)
            .filter(DefineExercise.name == name, CoachDefinedExercisesRelationship.coach_id.in_(coach_ids))
            .group_by(DefineExercise.id)
            .having(func.count(CoachDefinedExercisesRelationship.coach_id.distinct()) == len(coach_ids))
            .first()
        )

        if existing_exercise_for_coaches:
            return jsonify({'error': 'Exercise with the given name already exists for a category for all specified coaches'}), 400

        # # Create instances of DefineExercise for each coach
        # exercises = []

        # Check if the exercise type exists
        exercise_type = ExerciseType.query.get(type_id)
        if not exercise_type:
            return jsonify({'error': 'ExerciseType with the given type_id does not exist'}), 404

        # Check if the exercise type has a category
        category_id = exercise_type.category_id

        # Iterate through each coach
        for coach_id in coach_ids:

            # Create instances of DefineExercise for each coach
            exercises = []
            
            print(f"coach_id: {coach_id}, type_id: {type_id}")

            # Check if the coach has a relationship with the category
            coach_category_relationship = CoachDefinedExercisesRelationship.query.filter_by(coach_id=coach_id, category_id=category_id).first()
            print(coach_category_relationship)

            if not coach_category_relationship:
                return jsonify({'error': f'Coach {coach_id} does not have a relationship with the category'}), 400

            # Check if the exercise already exists for this coach
            existing_exercise = (
                DefineExercise.query
                .join(ExerciseType, DefineExercise.type_id == ExerciseType.id)
                .join(CoachDefinedExercisesRelationship, ExerciseType.category_id == CoachDefinedExercisesRelationship.category_id)
                .filter(DefineExercise.name == name, DefineExercise.type_id == type_id, CoachDefinedExercisesRelationship.coach_id == coach_id)
                .first()
            )

            if existing_exercise:
                # If the exercise already exists, update its properties
                existing_exercise.name = name
                existing_exercise.type_id = type_id
            else:
                # If the exercise does not exist, create a new one
                exercise = DefineExercise(name=name, type_id=type_id)
                
                # Associate with the coach through the existing relationship
                exercise.relationship = coach_category_relationship
                
                exercises.append(exercise)

        # Add the exercises to the database
        db.session.add_all(exercises)
        db.session.commit()

        return jsonify({'message': 'Exercises added successfully!'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


#Notifications tha will appear and will be used on athlete side 

@app.route('/addNotificationAthlete', methods=['POST'])
def add_notification_coach():
    try:
        data = request.json

        # Extracting data from request
        athlete_id = data.get('athlete_id')
        coach_id = data.get('coach_id')
        workout_name = data.get('workout_name')
        date = data.get('date')
        status = data.get('status', 'unopened')  # Default status is 'unopened'

        # Validating the required fields
        if not all([athlete_id, coach_id, workout_name, date]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Create a new notification instance
        new_notification = AthleteNotification(
            athlete_id=athlete_id,
            coach_id=coach_id,
            workout_name=workout_name,
            date=date,
            status=status
        )

        # Add the new notification to the database
        db.session.add(new_notification)
        db.session.commit()
        methods.send_email(coach_id, athlete_id, workout_name, "athlete", date)
        return jsonify({'success': 'Notification added successfully'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/notifications/athlete/update/<int:notification_id>', methods=['PUT'])
def update_athlete_notification_status(notification_id):
    notification = AthleteNotification.query.filter_by(notification_id=notification_id).first()
    if notification:
        notification.status = 'opened'
        db.session.commit()
        return jsonify({"message": "Notification status updated to opened"}), 200
    else:
        return jsonify({"message": "Notification not found"}), 404
    


  
@app.route('/notifications/athlete/<int:athlete_id>', methods=['GET'])
def get_notifications_for_athlete(athlete_id):
    notifications = AthleteNotification.query.filter_by(athlete_id=athlete_id).order_by(AthleteNotification.notification_id.desc()).all()
    notifications_list = [
        {
            "notification_id": notification.notification_id,
            "coach_id": notification.coach_id,
            "workout_name": notification.workout_name,  # Changed from workout_id to workout_name
            "date": notification.date.strftime("%Y-%m-%d"),
            "status": notification.status
        } for notification in notifications
    ]
    return jsonify(notifications_list)


#Coach side notifications 

@app.route('/addNotificationCoach', methods=['POST'])
def add_notification():
    # Extract data from the request body
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['coach_id', 'athlete_id', 'workout_id', 'date', 'status']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing data'}), 400
    
    # Parse the date
    try:
        notification_date = datetime.strptime(data['date'], "%Y-%m-%d").date()
    except ValueError:
        return jsonify({'error': 'Invalid date format, expected YYYY-MM-DD'}), 400

    # Create a new notification object
    new_notification = CoachNotification(
        coach_id=data['coach_id'],
        athlete_id=data['athlete_id'],
        workout_id=data['workout_id'],
        date=notification_date,
        status=data['status']
    )
    workout = db.session.query(Workouts).filter_by(workout_id=data['workout_id']).first()
    # Add the new notification to the database
    try:
        db.session.add(new_notification)
        db.session.commit()
        methods.send_email(data['coach_id'], data['athlete_id'], workout.name, "coach", notification_date)
        return jsonify({'message': 'Notification added successfully', 'notification_id': new_notification.notification_id}), 201
    except Exception as e:
        db.session.rollback()
        print(str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/notifications/update/coach<int:notification_id>', methods=['PUT'])
def update_notification_status(notification_id):
    notification = CoachNotification.query.filter_by(notification_id=notification_id).first()
    if notification:
        notification.status = 'opened'
        db.session.commit()
        return jsonify({"message": "Notification status updated to opened"}), 200
    else:
        return jsonify({"message": "Notification not found"}), 404
    
@app.route('/notificationsCoach', methods=['GET'])
def notifications_coach():
    coach_id = request.args.get('coach_id', type=int)
    if coach_id is None:
        return jsonify({'error': 'Coach ID not provided'}), 400
    notifications = CoachNotification.query.filter_by(coach_id=coach_id).order_by(CoachNotification.notification_id.desc()).all()
    notifications_list = [
        {
            "notification_id": notification.notification_id,
            "athlete_id": notification.athlete_id,
            "workout_id": notification.workout_id,
            "date": notification.date.strftime("%Y-%m-%d"),
            "status": notification.status
        } for notification in notifications
    ]
    return jsonify(notifications_list)

@app.route('/getCoachIdd', methods=['GET'])
def get_coach_idd():
    coach_username = request.args.get('coachUsername', type=str)
    if coach_username is None:
        return jsonify({'error': 'Coach username not given'}), 400

    coach = Coaches.query.filter_by(email=coach_username).first()
    if coach:
        coach_id = coach.coach_id
        return jsonify({"coach_id": coach_id}), 200
    else:
        return jsonify({"error": f"No coach found with email/username {coach_username}"}), 404
    
@app.route('/getWorkoutName/<int:workout_id>', methods=['GET'])
def get_workout_name(workout_id):
    workout = Workouts.query.filter_by(workout_id=workout_id).first()
    if workout:
        return jsonify({'workout_name': workout.name}), 200
    else:
        return jsonify({'error': 'Workout not found'}), 404


####
# Defining to get the Test by team
@app.route('/getTestWorkoutsByTeam', methods=['GET'])
def get_test_workouts_by_team():
    # Retrieve the parameters from the request
    team_id = request.args.get('teamId', type=int)
    date_str = request.args.get('date')
    coach_id = request.args.get('coachId', type=int)

    # Convert the date string to a datetime object (if provided)
    if date_str:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    else:
        date = None

    print(date)
    # Query the database to fetch the data based on the parameters
    assigned_workout_ids = TestsTeamWorkoutsAssignments.query.filter_by(team_id=team_id).with_entities(TestsTeamWorkoutsAssignments.test_workout_id).all()
    # print("Team assignment IDs : ", assigned_workout_ids)
    result = []

    for assignment in assigned_workout_ids:

        test_workout_id = assignment.test_workout_id

        test_workout = TestsWorkouts.query.get(test_workout_id)

        if ((test_workout.coach_id == coach_id) and (test_workout.date_added == date)):
            # print("Testing")
            test_workout_data = {
                'test_workout_id': test_workout.test_workout_id,
                'name': test_workout.name,
                'date_added': test_workout.date_added,
                'coach_id': test_workout.coach_id,
                'blocks': []
            }
            print("Dict here : ", test_workout_data)
            # print(workout_data)
            blocks = TestsBlocks.query.filter_by(test_workout_id=test_workout.test_workout_id).all()
            for block in blocks:
                block_data = {
                    'test_block_id': block.test_block_id,
                    'name': block.name,
                    'exercises': []
                }
                # print(workout_data)
                exercises = TestsExercises.query.filter_by(test_block_id=block.test_block_id).all()

                for exercise in exercises:
                    exercise_data = {
                        'test_exercise_id': exercise.test_exercise_id,
                        'name': exercise.name,
                        'loads_reps': exercise.loads_reps,
                        'sets': exercise.sets
                    }

                    block_data['exercises'].append(exercise_data)

                test_workout_data['blocks'].append(block_data)
            # print(workout_data)
            result.append(test_workout_data)

    return jsonify(result)
    
    
    


# Get a particular workout with workout id
@app.route('/getTestWorkout2', methods=['GET'])
def get_test_workout2():
    try:
        athlete_id = request.args.get('athleteId', type=int)
        team_id = request.args.get('teamId', type=int)
        coach_id = request.args.get('coachId', type=int)
        date = request.args.get('date', type=str)  # You can adjust the data type as needed

        workouts_query = TestsWorkouts.query
        workouts_query_1 = []
        workouts_query_2 = []
        if athlete_id is not None:
            #print("athlete id given")
            workouts_query_1 = workouts_query.filter(
                TestsWorkouts.test_workout_id.in_(
                    db.session.query(TestsAthleteWorkouts.test_workout_id).filter_by(athlete_id=athlete_id)
                )
            )
            print(workouts_query_1)

        if team_id is not None:
            #print("teamId id given")
            workouts_query_2 = workouts_query.filter(
                TestsWorkouts.test_workout_id.in_(
                    db.session.query(TestsTeamWorkoutsAssignments.test_workout_id).filter_by(team_id=team_id)
                )
            )
            print(workouts_query_2)

        if not athlete_id and not team_id :
            return jsonify({"error": "Provide either athleteId or teamId"}), 400
        
        if workouts_query_1:
            if coach_id is not None:
                workouts_query_1 = workouts_query_1.filter_by(coach_id=coach_id)
            
            if date:
                print("Inside this date", type(date))
                workouts_query_1 = workouts_query_1.filter(TestsWorkouts.date_added == date)

            workouts_query_1 = workouts_query_1.all() 
            

        if workouts_query_2:
            if coach_id is not None:
                workouts_query_2 = workouts_query_2.filter_by(coach_id=coach_id)
            
            if date :
                #print("Inside this date",type(date))
                workouts_query_2 = workouts_query_2.filter(TestsWorkouts.date_added == date)

            workouts_query_2 = workouts_query_2.all()

        workouts = workouts_query_1 + workouts_query_2 

        # workouts = workouts_query.all()
        print(workouts)
        if not workouts:
            return jsonify({'message': 'No Tests found with the provided constraints'})

        workout_list = []
        for workout in workouts:
            workout_data = {
                'workout_name': workout.name,
                'date_added': workout.date_added.strftime('%Y-%m-%d'),
                'coach_name': workout.coach.name,
                'blocks': []
            }

            blocks = TestsBlocks.query.filter_by(test_workout_id=workout.test_workout_id).all()

            for block in blocks:
                block_data = {
                    'block_name': block.name,
                    'exercises': []
                }

                exercises = TestsExercises.query.filter_by(test_block_id=block.test_block_id).all()

                for exercise in exercises:
                    exercise_data = {
                        'exercise_name': exercise.name,
                        'loads_reps': exercise.loads_reps,
                        'sets': exercise.sets
                    }
                    block_data['exercises'].append(exercise_data)

                workout_data['blocks'].append(block_data)

            workout_list.append(workout_data)

        return jsonify(workout_list), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    



    


# Get a particular Workout by athlete_id
@app.route('/getTestWorkoutsByAthleteDirect', methods=['GET'])
def get_test_workouts_by_athlete_membership():
    athlete_id = request.args.get('athleteId', type=int)
    date_str = request.args.get('date')
    coach_id = request.args.get('coachId', type=int)
    

    # 2 places to check : AthleteWorkouts Table & TeamWorkouts Table
    # Parse the date parameter if provided
    date = None
    if date_str:
        date = datetime.strptime(date_str, '%Y-%m-%d')
    
    # Query the workouts assigned to the athlete by their ID, date (if provided), and coach_id
    if athlete_id:
        workouts = TestsWorkouts.query.join(TestsAthleteWorkouts,TestsAthleteWorkouts.test_workout_id == TestsWorkouts.test_workout_id).filter_by(athlete_id=athlete_id)
    else:
        return jsonify({'error': 'Athlete_id not found'}), 404
    
    print(workouts)

    if date:
        workouts = workouts.filter(TestsWorkouts.date_added == date)
    
    print(workouts)


    if coach_id:
        workouts = workouts.filter(TestsWorkouts.coach_id == coach_id)
        print(workouts)
    else:
        return jsonify({'error': 'Coach_id not found'}),400
    workouts = workouts.all()
    print(workouts)
    
    results = []
    for workout in workouts:
        workout_data = {
                    'test_workout_id': workout.test_workout_id,
                    'name': workout.name,
                    'date_added': workout.date_added,
                    'coach_id': workout.coach_id,
                    'blocks': []
                    }


        blocks = TestsBlocks.query.filter_by(test_workout_id=workout.test_workout_id).all()

        for block in blocks:
            block_data = {
                'test_block_id': block.test_block_id,
                'name': block.name,
                'exercises': []
            }

            exercises = TestsExercises.query.filter_by(test_block_id=block.test_block_id).all()

            for exercise in exercises:
                exercise_data = {
                    'test_exercise_id': exercise.test_exercise_id,
                    'name': exercise.name,
                    'loads_reps': exercise.loads_reps,
                    'sets': exercise.sets
                }

                block_data['exercises'].append(exercise_data)

            workout_data['blocks'].append(block_data)

        results.append(workout_data)
    return jsonify(results)




# New route
@app.route('/getTestBlocksByTestWorkout', methods=['GET'])
def get_test_blocks_by_test_workout():
    try:
        workout_id = request.args.get('workoutId', type=int)

        if workout_id is not None:
            blocks = TestsBlocks.query.filter_by(test_workout_id=workout_id).all()

            blocks_list = []
            for block in blocks:
                block_data = {
                    'test_block_id': block.test_block_id,
                    'name': block.name,
                }
                blocks_list.append(block_data)

            return jsonify(blocks=blocks_list), 200

        return jsonify({'error': 'test_workoutId is required in the query parameters'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 400




@app.route('/getTestExercisesByTestBlock', methods=['GET'])
def get_test_exercises_by_test_block():
    try:
        block_id = request.args.get('blockId', type=int)

        if block_id is not None:
            exercises = TestsExercises.query.filter_by(test_block_id=block_id).all()

            exercise_list = []
            for exercise in exercises:
                exercise_data = {
                    'test_exercise_id': exercise.test_exercise_id,
                    'name': exercise.name,
                    'loads_reps': exercise.loads_reps,
                    'sets': exercise.sets
                }
                exercise_list.append(exercise_data)

            return jsonify(exercises=exercise_list), 200

        return jsonify({'error': 'blockId is required in the query parameters'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 400

   
    
    addNotificationCoach

# Get Exercise Details by exercise ID
@app.route('/getTestExerciseDetails', methods=['GET'])
def get_test_exercises_details():
    try:
        exercise_id = request.args.get('exerciseId', type=int)

        if exercise_id is not None:
            exercise = TestsExercises.query.filter_by(test_exercise_id=exercise_id).first()

        if exercise:
            exercise_detail = {
                    'test_exercise_id': exercise.test_exercise_id,
                    'name': exercise.name,
                    'loads_reps': exercise.loads_reps,
                    'sets': exercise.sets
                }
            print(exercise_detail)
            return jsonify([exercise_detail]), 200

        return jsonify({'error': 'exerciseId is required in the query parameters'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    


@app.route('/showTestAthleteExerciseInputLoads', methods=["GET"])
def check_test_athlete_exercise_input_loads():
    # Pass the exercise id
    exercise_id =  request.args.get('exerciseId')
    athlete_id = request.args.get('athleteId')

    if athlete_id is None :
            return jsonify({'error': 'athleteId is required '}), 400
            
    if exercise_id is None :
            return jsonify({'error': 'exerciseId  is required '}), 400

    exercise = TestsExercises.query.filter_by(test_exercise_id=exercise_id).first()
    athlete = Athletes.query.filter_by(athlete_id=athlete_id).first()

    if exercise and athlete:
        athlete_input = TestsAthleteExerciseInputLoads.query.filter_by(test_exercise_id=exercise_id, athlete_id=athlete_id).first()

        if athlete_input:
            # Send back the input_loads
            athlete_exercise_input = {
                'test_load_id': athlete_input.test_load_id,
                'input_load': athlete_input.input_load,
                'exercise_completed_date':athlete_input.exercise_completed_date,
            }
            return jsonify(athlete_exercise_input) , 200
        
    return jsonify({'info':'No exercise input found'}) , 200


# Athlete User input processing
@app.route('/postTestAthleteInputs', methods=["POST"])
def save_test_athlete_inputs():
    # Check if its a team workout or its an athlete Workout
    athlete_exercise_input = request.json

    # If its a team workout assignment, create the record for 
    athlete_id = athlete_exercise_input.get('athlete_id')
    exercise_id = athlete_exercise_input.get('test_exercise_id')
    input_load = athlete_exercise_input.get('input_load')
    date = athlete_exercise_input.get('date')

    if athlete_id is None :
        return jsonify({'error': 'athleteId is required '}), 400
        
    if exercise_id is None :
         return jsonify({'error': 'exerciseId  is required '}), 400

    exercise = TestsExercises.query.filter_by(test_exercise_id=exercise_id).first()
    athlete = Athletes.query.filter_by(athlete_id=athlete_id).first()

    if exercise and athlete:
        # Check athleteinput for exericse is  existing ? UPDATE : INSERT
        exercise_input_present = TestsAthleteExerciseInputLoads.query.filter_by(test_exercise_id=exercise_id,athlete_id=athlete_id).first()

        # Create the exercise in the AthleteExerciseInputLoads table
        if exercise_input_present :
            # Update the same value in the database
            exercise_input_present.input_load = input_load
            exercise_input_present.exercise_completed_date = date
            db.session.commit()
        else:
            athlete_exercise = TestsAthleteExerciseInputLoads(athlete_id=athlete_id,test_exercise_id=exercise_id,input_load=input_load,exercise_completed_date=date)
            db.session.add(athlete_exercise)
            db.session.commit()

        return jsonify({"success":"Input Load Saved successfully"}),200
    
    return jsonify({'error':"This Exercise is non existent"}) , 400



@app.route('/getTestWorkoutforAthletebyTeamsByCoach')
def get_test_workouts_for_athlete_by_Teams_by_coach():
    athlete_id = request.args.get('athleteId')
    coach_id = request.args.get('coachId')
    date = request.args.get('date')
    
    if date:
        teams = db.session.query(Teams).filter(Teams.coach_id == coach_id)
        # teams = teams.filter(Workouts.date_added == date)
    else:
        teams = db.session.query(Teams).filter(Teams.coach_id == coach_id)

    teams = teams.join(TeamMemberships).filter(TeamMemberships.athlete_id == athlete_id)
    teams = teams.all()

    result = []
    for team in teams:
        team_data = {
            "team_id": team.team_id,
            "team_name": team.name,
            "workouts": []
        }

        team_workouts = db.session.query(TestsTeamWorkoutsAssignments).filter_by(team_id=team.team_id).all()

        for team_workout in team_workouts:
            workout_data = {
                "workout_name": db.session.query(TestsWorkouts).get(team_workout.test_workout_id).name,
                "date_added": db.session.query(TestsWorkouts).get(team_workout.test_workout_id).date_added.strftime('%Y-%m-%d'),
                "blocks": []
            }

            blocks = db.session.query(TestsBlocks).filter_by(test_workout_id=team_workout.test_workout_id).all()

            for block in blocks:
                block_data = {
                    "block_name": block.name,
                    "exercises": []
                }

                exercises = db.session.query(TestsExercises).filter_by(test_block_id=block.test_block_id).all()

                for exercise in exercises:
                    exercise_data = {
                        "exercise_name": exercise.name,
                        "loads_reps": exercise.loads_reps,
                        "sets": exercise.sets
                    }

                    block_data["exercises"].append(exercise_data)

                workout_data["blocks"].append(block_data)

            team_data["workouts"].append(workout_data)

        result.append(team_data)

    return jsonify(result)




# For adding a workout and assiging to the athletes/teams
@app.route('/addTestWorkoutAndAssign', methods=['POST'])
def add_test_workout_and_assign():
    try:
        data = request.get_json()
        name =  data['name']
        athlete_id = data.get('athlete_id')
        if athlete_id:
            athlete_id = int(athlete_id)

        team_id = data.get('team_id')
        if team_id:
            team_id = int(team_id)


        if not team_id and not athlete_id:
            return jsonify({"error": "Please provide the athleteId or teamId"}), 404
        

        coach_id = int(data['coach_id']) 
        date_added = data['date_added']


        if date_added is None or coach_id is None :
            return jsonify({"error": "Please provide the date and coachId"}), 404
        else:
            date_added = datetime.strptime(date_added, '%Y-%m-%d').date()


        if data['athlete_id'] :
            workouts = TestsWorkouts.query.filter_by(name=name, coach_id=coach_id, date_added=date_added)
            workouts = workouts.join(TestsAthleteWorkouts,TestsAthleteWorkouts.test_workout_id == TestsWorkouts.test_workout_id).filter_by(athlete_id=athlete_id).all()
            print("Tests", workouts)

            if workouts:
                return jsonify({'workoutExists': 'Tests Exists - You cannot add Tests'}), 200
            else:
                # Add the workout
                print("You can add Tests now")
                
                # Now add the workouts
                new_workout = TestsWorkouts(name=data['name'], coach_id=data['coach_id'],date_added=date_added)
                db.session.add(new_workout)
                db.session.commit()

                athlete_workout = TestsAthleteWorkouts(
                    athlete_id=data['athlete_id'],
                    test_workout_id=new_workout.test_workout_id,
                )
                db.session.add(athlete_workout)
        #  time.sleep(3) 
                blocks = []
                # print(workout_data)
                blocks = data.get("blocks") 
                print(blocks)
                for block in blocks:
                    block_data = {
                        'name': block["name"],
                        'test_workout_id': new_workout.test_workout_id,
                        'exercises' : block["exercises"]
                    }

                    new_block = TestsBlocks(name=block_data["name"], test_workout_id=block_data["test_workout_id"])
                    db.session.add(new_block)
                    db.session.commit()

                    for exercise in block_data["exercises"]:
                        exercise_data = {
                            'name': exercise["name"],
                            'loads_reps': exercise["loads_reps"],
                            'sets': exercise["sets"],
                            'test_block_id':new_block.test_block_id,
                        }

                        new_exercise = TestsExercises(name=exercise_data["name"], loads_reps=exercise_data["loads_reps"], sets=exercise_data["sets"], test_block_id=exercise_data["test_block_id"])
                        db.session.add(new_exercise)
                        db.session.commit()
                    
                #return jsonify({"Success": "Workout Added Successfully"})
                return jsonify({"Success": "Workout Added Successfully to athlete", "test_workout_id" : f"{new_workout.test_workout_id}"})
            
        elif data['team_id']:
            workouts = TestsWorkouts.query.filter_by(name=name, coach_id=coach_id, date_added=date_added)
            workouts = workouts.join(TestsTeamWorkoutsAssignments,TestsTeamWorkoutsAssignments.test_workout_id == TestsWorkouts.test_workout_id).filter_by(team_id=team_id).all()
            print("Workouts", workouts)

            if workouts:
                return jsonify({'workoutExists': 'You cannot add Tests'}), 200
            else:
                # Add the workout
                print("You can add Tests now")

                new_workout = TestsWorkouts(name=data['name'], coach_id=data['coach_id'],date_added=date_added)
                db.session.add(new_workout)
                db.session.commit()

                team_workout_assignment = TestsTeamWorkoutsAssignments(
                    team_id=data['team_id'],
                    test_workout_id=new_workout.test_workout_id
                )
                db.session.add(team_workout_assignment)


                # time.sleep(3) 
                blocks = []
                # print(workout_data)
                blocks = data.get("blocks") 
                print(blocks)
                for block in blocks:
                    block_data = {
                        'name': block["name"],
                        'test_workout_id': new_workout.test_workout_id,
                        'exercises' : block["exercises"]
                    }

                    new_block = TestsBlocks(name=block_data["name"], test_workout_id=block_data["test_workout_id"])
                    db.session.add(new_block)
                    db.session.commit()

                    for exercise in block_data["exercises"]:
                        exercise_data = {
                            'name': exercise["name"],
                            'loads_reps': exercise["loads_reps"],
                            'sets': exercise["sets"],
                            'test_block_id':new_block.test_block_id,
                        }

                        new_exercise = TestsExercises(name=exercise_data["name"], loads_reps=exercise_data["loads_reps"], sets=exercise_data["sets"], test_block_id=exercise_data["test_block_id"])
                        db.session.add(new_exercise)
                        db.session.commit()
                 
                # return jsonify({"Success": "Workout Added Successfully"})
                return jsonify({"Success": "Test Added Successfully to team", "workout_id" : f"{new_workout.test_workout_id}"})
                # Update Athlete workouts Table
    except Exception as e:
        return jsonify({'error': f'Error Observed : {str(e)}'}), 500   
    