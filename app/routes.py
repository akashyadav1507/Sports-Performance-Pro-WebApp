# app/routes.py
from mysqlx import IntegrityError
from app import app,db
from app.models import Coaches, CoachAthleteMembership, Athletes, Teams, TeamMemberships, Workouts, Blocks, Exercises, Notes, AthleteWorkouts, TeamWorkoutsAssignments, Category, ExerciseType, DefineExercise
from flask import jsonify,request, Flask, render_template, request, redirect, url_for, session
from app import methods
from flask_bcrypt import Bcrypt
from sqlalchemy import insert
from dateutil.parser import parse
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
            print(coach_data)
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
def add_block():
    try:
        data = request.get_json()
        print(data)
        if 'name' not in data or 'workout_id' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        workout = Workouts.query.get(data['workout_id'])
        if not workout:
            return jsonify({'error': 'Workout not found'}), 404

        # Create a new block instance and add it to the database
        new_block = Blocks(name=data['name'], workout_id=data['workout_id'])
        db.session.add(new_block)
        db.session.commit()
        return jsonify({'message': 'Block added successfully', 'block_id': new_block.block_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


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

    notes = Notes.query.filter_by(coach_id=coach_id, athlete_id=athlete_id).all()

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


#Route for coach home
@app.route('/coachAthleteHome')
def coach_signup():
    return render_template("login.html")

#Route for coach login
@app.route('/coachLogin', methods=['POST'])
def coach_login():
    if request.method == 'POST':
        data = request.get_json(force=True)
        if methods.coaches_username_is_valid(data.get('username'), data.get('password')):
            session['username'] = data.get('username')
            return "Successful"
        else:
            message="Wrong coach username password!"
            return message

#Route for athlete login
@app.route('/athleteLogin', methods=['POST'])
def athlete_login():
    if request.method == 'POST':
        data = request.get_json(force=True)
        if methods.athlete_username_is_valid(data.get('username'), data.get('password')):
            session['username'] = data.get('username')
            return "Successful"
        else:
            message="Wrong athlete username password!"
            return message


#Route for succesful athlete login and landing page
@app.route('/athleteLanding')
def athlete_landing():
    return render_template("athlete-landing-4.html")


#Route for coach registration page
@app.route('/registerCoach')
def register_coach():
    return render_template("registration-coach.html")


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
        sports_string = ', '.join(data['sports'])
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
    return render_template("Admin_landing.html")

#Route for coach landing
@app.route('/coachLanding')
def coach_landing():
    return render_template("coach-landing-page.html")

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

@app.route('/teamWorkout')
def teamWorkout():
    return render_template('team-workout.html')

@app.route('/coachNotes')
def coachNotes():
    return render_template('coachNotes.html')

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


@app.route('/createTeamAndMemberships', methods=['POST'])
def create_team_and_memberships():
    try:
        data = request.get_json()

        # Validate data and check for required fields
        if 'name' not in data or 'sport' not in data or 'coach_id' not in data or 'athlete_ids' not in data:
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

# Define the /getTeamName API endpoint
@app.route('/getTeamName', methods=['GET'])
def get_team_name():
    # Get the teamId from the query parameters
    team_id = request.args.get('teamId')

    # Query the Teams model to get the team name
    team = Teams.query.get(team_id)

    if team:
        # Team exists; retrieve the name
        team_name = team.name
        return jsonify({'teamName': team_name})
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
                'name': athlete.name,
                'sports': athlete.sports,
                'institute': athlete.institute,
                'coach_id': coach_id  # Since coach_id is from the request parameter
                # Add more fields as needed
            }
            athlete_list.append(athlete_data)

    # Return the athlete data as JSON
    return jsonify(athletes=athlete_list)


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
@app.route('/get_blocks', methods=['GET'])
def get_blocks():
    athlete_id = int(request.args.get('athleteId'))
    coach_id = int(request.args.get('coachId'))
    selected_date_str = request.args.get('selectedDate')

    # Parse the selected date into a datetime object
    selected_date = parse(selected_date_str).date()

    # Query the database to find the athlete based on athlete_id and coach_id
    athlete = AthleteWorkouts.query.filter_by(athlete_id=athlete_id).first()

    if athlete:
        # Query the database to find the workouts for the athlete
        workouts = Workouts.query.filter_by(coach_id=coach_id).all()

        blocks = []

        # Iterate through the workouts and filter blocks based on the selected date
        for workout in workouts:
            if workout.date_added == selected_date:
                # Query the database to find the blocks for the workout
                workout_blocks = Blocks.query.filter_by(workout_id=workout.workout_id).all()
                for block in workout_blocks:
                    # Query the database to find the exercises for the block, including loads_reps and sets
                    block_exercises = Exercises.query.filter_by(block_id=block.block_id).all()
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

        print(blocks)
        return jsonify(blocks)
    else:
        return "Athlete not found", 404


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


@app.route('/getBlocksByWorkout', methods=['GET'])
def get_blocks_by_workout():
    try:
        workout_id = request.args.get('workoutId', type=int)

        if workout_id is not None:
            blocks = Blocks.query.filter_by(workout_id=workout_id).all()

            block_list = []
            for block in blocks:
                block_data = {
                    'block_id': block.block_id,
                    'name': block.name
                }
                block_list.append(block_data)

            return jsonify(blocks=block_list), 200

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
    

@app.route('/api/exercises', methods=['GET'])
def get_exercises():
    exercises = DefineExercise.query.join(
        ExerciseType, DefineExercise.type_id == ExerciseType.id
    ).join(Category, ExerciseType.category_id == Category.id).all()

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


@app.route('/api/exercises/<int:exercise_id>', methods=['DELETE'])
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


