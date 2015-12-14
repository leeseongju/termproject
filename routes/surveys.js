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

router.get('/new',needAuth, function(req, res, next) {
  res.render('surveys/new', {survey: {}});
});

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
  survey.save(function(err, doc) {
    if (err) {
      return next(err);
    }
    res.redirect('/surveys/'+ doc.id);
  });
});

router.get('/:id',needAuth, function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    Comment.find({survey: survey.id}, function(err, comments) {
      if (err) {
        return next(err);
      }
      res.render('surveys/show', {survey: survey, comments: comments});
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
      res.render('surveys/show', {survey: survey, answers: answers});
    });
  });
});

router.get('/:id/edit',needAuth, function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    res.render('surveys/edit', {survey: survey});
  });
});
router.put('/:id', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    title= req.body.title,
    email= req.body.email,
    content= req.body.content,
    type= req.body.type,
    category1 = req.body.category1,
    category2 = req.body.category2,
    category3 = req.body.category3,
    category4 = req.body.category4
      survey.save(function(err) {
        res.redirect('/surveys/' + req.params.id);
      });

    res.redirect('back');
  });
});

router.delete('/:id',needAuth, function(req, res, next) {
  Survey.findOneAndRemove(req.params.id, function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', '사용자 계정이 삭제되었습니다.');
    res.redirect('/surveys');
  });
});
router.post('/:id/comments', function(req, res, next) {
  var comment = new Comment({
    survey: req.params.id,
    email: req.body.email,
    content: req.body.content
  });

  comment.save(function(err) {
    if (err) {
      return next(err);
    }
    Survey.findByIdAndUpdate(req.params.id, {$inc: {numComment: 1}}, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/surveys/' + req.params.id);
    });
  });
});

router.post('/:id/answers', function(req, res, next) {
  var answer  = new Answer({
    survey: req.params.id,
    email: req.body.email,
    answer: req.body.answer
  });

  answer.save(function(err) {
    if (err) {
      return next(err);
    }
    Survey.findByIdAndUpdate(req.params.id, {$inc: {numAnswer: 1}}, function(err) {
      if (err) {
        return next(err);
      }

      res.redirect('/surveys/' + req.params.id);
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
      res.render('surveys/index', {
        surveys: surveys,
        pagination: pagination(count, page, perPage, function(p) {
          return '/surveys?page=' + p;
        })
      });
    });
  });
});






module.exports = router;
