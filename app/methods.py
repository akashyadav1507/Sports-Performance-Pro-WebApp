from app.models import Coaches, Athletes, Admin
import bcrypt
from flask_bcrypt import check_password_hash

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
