var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose()

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

var replace = require("replace");


/* GET home page. */
router.get('/', function (req, res, next) {
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      //Query if the table exists if not lets create it on the fly!
      db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name='blog'`,
        (err, rows) => {
          if (rows.length === 1) {
            console.log("Table exists!");
            db.all(` select blog_id, blog_txt from blog`, (err, rows) => {
              console.log("returning " + rows.length + " records");
              res.render('index', { title: 'Express', data: rows });
            });
          } else {
            console.log("Creating table and inserting some sample data");
            db.exec(`create table blog (
                     blog_id INTEGER PRIMARY KEY AUTOINCREMENT,
                     blog_txt text NOT NULL);
                      insert into blog (blog_txt)
                      values ('This is a great blog'),
                             ('Oh my goodness blogging is fun');`,
              () => {
                db.all(` select blog_id, blog_txt from blog`, (err, rows) => {
                  res.render('index', { title: 'Express', data: rows });
                });
              });
          }
        });
    });
});

function testInfo(Input) {
  var ok = Input.replace(/'/g, 'BAD PERSON ALERT');
  return ok;
}

router.post('/add', (req, res, next) => {
  var db = new sqlite3.Database('mydb.sqlite3', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      console.log("inserting " + req.body.blog);
      let result = testInfo(req.body.blog);
      db.exec(`insert into blog ( blog_txt) values ('${result}');`)
      //redirect to homepage
      res.redirect('/');
    }
  );
})

router.post('/delete', (req, res, next) => {
  var db = new sqlite3.Database('mydb.sqlite3', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      let result = testInfo(req.body.blog);
      db.exec(`delete from blog where blog_id='${result}';`);     
      /* trying to reset the blog number so it stays at the next lowest entry
      db.all(`select MAX(blog_id) from blog;`,
        (err, rows) => {
          console.log(rows[0].name);
        });
      */
      res.redirect('/');
    }
  );
})

router.post('/update', (req, res, next) => {
  var db = new sqlite3.Database('mydb.sqlite3', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      let result = testInfo(req.body.blog);
      let result2 = testInfo(req.body.blogCon);
      console.log("Updating Blog " + result +" with "+ result2);
      let copy = parseInt(result);
      copy = copy/copy;
      if(copy != 1){
        console.log("NOT A NUMBER");
      } else {
        db.exec(`UPDATE blog SET blog_txt = '${result2}' WHERE blog_id='${result}'`);
      }      
      //redirect to homepage
      res.redirect('/');
    }
  );
})

module.exports = router;
