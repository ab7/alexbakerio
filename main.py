import os
from datetime import date

from flask import Flask, request, session, g, redirect, url_for, render_template
from sqlite3 import dbapi2 as sqlite3

import secrets


# start app
app = Flask(__name__)

# configuration
app.config.update(dict(
    DATABASE = os.path.join(app.root_path, 'data/main.db'),
    DEBUG = True,
    SECRET_KEY = secrets.secret_key,
    USERNAME = secrets.username,
    PASSWORD = secrets.password
))
app.config.from_envvar('MAIN_SETTINGS', silent=True)


#############################################################
######              Database Functions                 ######
#############################################################
def connect_db():
    """Connects to the specific database."""
    rv = sqlite3.connect(app.config['DATABASE'], detect_types=sqlite3.PARSE_DECLTYPES)
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


#############################################################
######                 Public Routes                   ######
#############################################################
@app.route('/')
def front():
    return render_template('front.html')

@app.route('/blog')
def blog():
    db = get_db()
    cur = db.execute('select date, title, text from entries order by id desc')
    entries = [dict(date=row[0].strftime('%B %d, %Y'), title=row[1], text=row[2]) for row in cur.fetchall()]
    return render_template('blog.html', entries=entries)


#############################################################
######                 Admin Routes                    ######
#############################################################
@app.route('/admin')
def admin():
    if session.get('logged_in'):
        db = get_db()
        cur = db.execute('select id, date, title from entries order by id desc')
        entries = [dict(id=row[0], date=row[1], title=row[2]) for row in cur.fetchall()]
        return render_template('admin.html', entries=entries)
    else:
        return redirect(url_for('login'))

@app.route('/admin/add', methods=['GET', 'POST'])
def add_entry():
    if session.get('logged_in'):
        if request.method == 'POST':
            db = get_db()
            db.execute(
                'insert into entries (date, title, text) values (?, ?, ?)',
                [date.today(), request.form['title'], request.form['text']]
            )
            db.commit()
            return redirect(url_for('blog'))
        return render_template('add_entry.html')
    else:
        return redirect(url_for('login'))

@app.route('/admin/edit/<entry_id>', methods=['GET', 'POST'])
def edit_entry(entry_id):
    if session.get('logged_in'):
        if request.method == 'POST':
            db = get_db()
            db.execute(
                'update entries set title = ?, text = ? where id = ?', [request.form['title'], request.form['text'], entry_id]
            )
            db.commit()
            return redirect(url_for('admin'))
        db = get_db()
        cur = db.execute(
            'select title, text from entries where id = ?', [entry_id]
        ).fetchone()
        return render_template('add_entry.html', entry_id=entry_id, title=cur[0], content=cur[1])
    else:
        return redirect(url_for('login'))

@app.route('/admin/delete/<entry_id>')
def delete_entry(entry_id):
    if session.get('logged_in'):
        db = get_db()
        db.execute(
            'delete from entries where id=%s' % entry_id
        )
        db.commit()
        return redirect(url_for('admin'))
    else:
        return redirect(url_for('login'))

@app.route('/admin/login', methods=['GET', 'POST'])
def login():
    if session.get('logged_in'):
        return redirect(url_for('add_entry'))
    error = None
    if request.method == 'POST':
        if request.form['username'] != app.config['USERNAME']:
            error = "Invalid username"
        elif request.form['password'] != app.config['PASSWORD']:
            error = "Invalid password"
        else:
            session['logged_in'] = True
            return redirect(url_for('admin'))
    return render_template('login.html', error=error)

@app.route('/admin/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('blog'))
