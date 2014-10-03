import os

from flask import Flask, request, session, g, redirect, url_for, abort, render_template
from sqlite3 import dbapi2 as sqlite3

import secrets


# start app
app = Flask(__name__)

# configuration
app.config.update(dict(
    DATABASE = os.path.join(app.root_path, 'main.db'),
    DEBUG = False,
    SECRET_KEY = secrets.secret_key,
    USERNAME = secrets.username,
    PASSWORD = secrets.password
))
app.config.from_envvar('MAIN_SETTINGS', silent=True)

def connect_db():
    """Connects to the specific database."""
    rv = sqlite3.connect(app.config['DATABASE'])
    rv.row_factory = sqlite3.Row
    return rv

def init_db():
    """Initializes the database."""
    db = get_db()
    with app.open_resource('schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()

@app.cli.command('initdb')
def initdb_command():
    """Creates the database tables"""
    init_db()
    print "Initialized the database."

def get_db():
    """Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db

@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()

@app.route('/')
def front():
    return render_template('front.html')

@app.route('/blog')
def blog_entries():
    db = get_db()
    cur = db.execute('select title, text from entries order by id desc')
    entries = [dict(title=row[0], text=row[1]) for row in cur.fetchall()]
    return render_template('blog_entries.html', entries=entries)

@app.route('/blog/add', methods=['POST'])
def add_entry():
    if not session.get('logged_in'):
        abort(401)
    db = get_db()
    db.execute(
        'insert into entries (title, text) values (?, ?)',
        [request.form['title'], request.form['text']]
    )
    db.commit()
    return redirect(url_for('blog_entries'))

@app.route('/blog/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] != app.config['USERNAME']:
            error = "Invalid username"
        elif request.form['password'] != app.config['PASSWORD']:
            error = "Invalid password"
        else:
            session['logged_in'] = True
            return redirect(url_for('blog_entries'))
    return render_template('login.html', error=error)

@app.route('/blog/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('blog_entries'))
