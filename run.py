# run.py
from app import app,db

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=10000, debug=True)

    with app.app_context():
        db.create_all()
    app.run()
