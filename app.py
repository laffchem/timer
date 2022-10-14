from flask import Flask
from flask import render_template
from flaskwebgui import FlaskUI

app = Flask(__name__)
ui = FlaskUI(app, width=800, height=500)


@app.route("/")
def home():
    return render_template("timer.html")


if __name__ == "__main__":
    ui.run()
