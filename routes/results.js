var express = require('express'),
    Survey = require('../models/survey'),
    Comment = require('../models/comment'),
    Answer = require('../models/answer'),
    User = require('../models/User');
var router = express.Router();

function needAuth(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin');
    }
}

router.post('/', function(req, res, next) {
  var survey = new Survey({
    title: req.body.title,
    email: req.body.email,
    content: req.body.content,
    type: req.body.type,
    category1 : req.body.category1,
    category2 : req.body.category2,
    category3 : req.body.category3,
    category4 : req.body.category4
  });

  router.get('/', needAuth, function(req, res, next) {
    res.render('/results');
  });

  module.exports = router;
  survey.save(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/results');
  });
});

router.put('/:id', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    if (req.body.password === survey.password) {
      survey.email = req.body.email;
      survey.title = req.body.title;
      survey.content = req.body.content;
      survey.save(function(err) {
        res.redirect('/results/' + req.params.id);
      });
    }
    res.redirect('back');
  });
});

router.post('/:id/results', function(req, res, next) {
  var answer  = new Answer({
    survey: req.params.id,
    email: req.body.email,
    answer: req.body.answer
  });
  var survey = new Survey({
    title: req.body.title,
    email: req.body.email,
    content: req.body.content,
    type: req.body.type,
    category1 : req.body.category1,
    category2 : req.body.category2,
    category3 : req.body.category3,
    category4 : req.body.category4
  });

  survey.save(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/results/' + req.params.id);
  });

  answer.save(function(err) {
    if (err) {
      return next(err);
    }
    Survey.findByIdAndUpdate(req.params.id, {$inc: {numAnswer: 1}}, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/results/' + req.params.id);
    });
  });
});

function pagination(count, page, perPage, funcUrl ) {
  var pageMargin = 3;
  var firstPage = 1;
  var lastPage = Math.ceil(count / perPage);
  var prevPage = Math.max(page - 1, 1);
  var nextPage = Math.min(page + 1, lastPage);
  var pages = [];
  var startPage = Math.max(page - pageMargin, 1);
  var endPage = Math.min(startPage + (pageMargin * 2), lastPage);
  for(var i = startPage; i <= endPage; i++) {
    pages.push({
      text: i,
      cls: (page === i) ? 'active': '',
      url: funcUrl(i)
    });
  }
  return {
    numSurveys: count,
    firstPage: {cls: (page === 1) ? 'disabled' : '', url: funcUrl(1)},
    prevPage: {cls: (page === 1) ? 'disabled' : '', url: funcUrl(prevPage)},
    nextPage: {cls: (page === lastPage) ? 'disabled' : '', url: funcUrl(nextPage)},
    lastPage: {cls: (page === lastPage) ? 'disabled' : '', url: funcUrl(lastPage)},
    pages: pages
  };
}
router.get('/',needAuth, function(req, res, next) {
  var page = req.query.page || 1;
  page = parseInt(page, 10);
  var perPage = 10;
  Survey.count(function(err, count) {
    Survey.find({}).sort({createdAt: -1})
    .skip((page-1)*perPage).limit(perPage)
    .exec(function(err, surveys) {
      if (err) {
        return next(err);
      }
      res.render('results/index', {
        surveys: surveys,
        pagination: pagination(count, page, perPage, function(p) {
          return '/results?page=' + p;
        })
      });
    });
  });
});

router.get('/:id',needAuth, function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    Answer.find({survey: survey.id}, function(err, answers) {
      if (err) {
        return next(err);
      }
      res.render('results/show', {survey: survey, answers: answers});
    });
  });
});


module.exports = router;
