from app.models import Coaches, Athletes, Admin
from app import db, app
import bcrypt
from flask_bcrypt import check_password_hash
from flask_mail import Mail, Message
from run import app, mail

def athlete_username_is_valid(email, password):
    athlete = Athletes.query.filter_by(email=email).first()
    try:
        if athlete and check_password_hash(athlete.password, password):
            return athlete  
        else:
            return None 
    except ValueError:
        return "Error: Invalid salt detected during password check"


def coaches_username_is_valid(email, password):
    coach = Coaches.query.filter_by(email=email).first()
    try:
        if coach and check_password_hash(coach.password, password):
            return coach  
        else:
            return None 
    except ValueError:
        return "Error: Invalid salt detected during password check"


def admin_username_is_valid(email, password):
    admin = Admin.query.filter_by(username=email).first()
    try:
        if admin and password==admin.password:
            return admin  
        else:
            return None 
    except ValueError:
        return "Error: Invalid salt detected during password check"


def send_email(coach_id, athlete_id, workout_name, side, date_added):
    coach = db.session.query(Coaches).filter_by(coach_id=coach_id).first()
    athlete = db.session.query(Athletes).filter_by(athlete_id=athlete_id).first()
    recipient_email = None
    subject = None
    body = None
    name = None
    if(side == "athlete"):
        body= f"Coach {coach.name} assigned you the {workout_name} workout, <a href='http://3.145.22.60:10000/coachAthleteHome'>sign in</a> to check your status."
        subject= f"New workout assigned on {date_added}"
        recipient_email= athlete.email
        name = athlete.name
    else:
        body= f"Athlete {athlete.name} has completed the {workout_name} workout, <a href='http://3.145.22.60:10000/coachAthleteHome'>sign in</a> to check their progress."
        subject= f"New workout submission by {athlete.name}"
        recipient_email= coach.email
        name = coach.name
    html_body = f"""
    <html>
    <head></head>
    <body>
        <img src="cid:banner_image" alt="Header Image" style="width: 100%; max-width: 600px;">
        <div>
            <h4>Hello {name}!</h4>
            <p>{body}</p>
        </div>
    </body>
    </html>
    """
    msg = Message(subject, sender='sportsperformancepro.help@gmail.com', recipients=[recipient_email])
    msg.body = body  # Plain text version of the email
    msg.html = html_body  # HTML version of the email
    with app.open_resource("static/images/banner-images/banner-image-1.jpg") as fp:
        msg.attach("Athlete", "image/jpeg", fp.read(), 'inline', headers=[('Content-ID', '<banner_image>')])
    try:
        mail.send(msg)
        return "Email sent successfully"
    except Exception as e:
        print(e)
        return "Error"

def send_welcome_email(name, email, side):
    recipient_email = None
    subject = None
    body = None
    if(side == "athlete"):
        body= f"Elevate your training game, maximize results, and conquer the competition with Sports Performance Pro – where precision meets peak performance. Take charge of your athletic journey by putting in the work with us. <a href='http://3.145.22.60:10000/coachAthleteHome'>Get started now!</a>"
        subject= f"Welcome {name} from team Sports Performance Pro"
        recipient_email= email
    else:
        body= f"Welcome to Sports Performance Pro - your ultimate coaching companion for unlocking athletic excellence! Supercharge your coaching strategies with our state-of-the-art application designed to empower both you and your athletes. Effortlessly create, manage, and track personalized training plans while seamlessly monitoring and optimizing athlete performances. Elevate your coaching prowess, drive exceptional results, and outperform the competition with Sports Performance Pro – where precision meets peak coaching. Take the lead in shaping your team's success by putting in the work with us. <a href='http://3.145.22.60:10000/coachAthleteHome'>Get started now!</a>"
        subject= f"Welcome {name} from team Sports Performance Pro"
        recipient_email= email
    html_body = f"""
    <html>
    <head></head>
    <body>
        <img src="cid:banner_image" alt="Header Image" style="width: 100%; max-width: 600px;">
        <div>
            <h4>Hello {name}!</h4>
            <p>{body}</p>
        </div>
    </body>
    </html>
    """
    msg = Message(subject, sender='sportsperformancepro.help@gmail.com', recipients=[recipient_email])
    msg.body = body  # Plain text version of the email
    msg.html = html_body  # HTML version of the email
    with app.open_resource("static/images/banner-images/banner-image-1.jpg") as fp:
        msg.attach("Athlete", "image/jpeg", fp.read(), 'inline', headers=[('Content-ID', '<banner_image>')])
    try:
        mail.send(msg)
        return "Email sent successfully"
    except Exception as e:
        print(e)
        return "Error"

