"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

const fetch = require('node-fetch');

const cheerio = require('cheerio');

exports.sourceNodes = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2.default)(function* ({
    actions,
    createNodeId,
    createContentDigest
  }, {
    businessId,
    limit = 5
  }) {
    const createNode = actions.createNode;

    if (!businessId || typeof businessId !== 'string') {
      throw new Error("You must supply a valid business id from yell e.g. 'company-name-73987865'");
    }

    const url = `https://www.yell.com/biz/${businessId}/?version=2&showAllReviews=true#reviews`;
    return fetch(url).then(res => res.text()).then(body => {
      const $ = cheerio.load(body);
      const reviewsDiv = $('.reviewsList');
      let reviews = [];

      for (let i = 0; i < limit; i++) {
        const reviewDiv = $(reviewsDiv).find('.review')[i];
        let review = {
          id: '',
          author: '',
          title: '',
          content: '',
          score: '',
          createdAt: ''
        };
        review.id = reviewDiv.attr('id');
        review.author = reviewDiv.find('meta[itemprop="name"]').attr('content');
        review.title = reviewDiv.find('.review--title').text();
        review.content = reviewDiv.find('.review--content').text();
        review.score = reviewDiv.find('.starRating--value').text();
        review.createdAt = reviewDiv.find('.review--date').attr('datetime');
        reviews.push(review);
      }

      reviews.forEach(datum => {
        const nodeContent = JSON.stringify(datum);
        const nodeMeta = {
          id: createNodeId(`yell-review-${datum.id}`),
          parent: null,
          children: [],
          internal: {
            type: `YellReview`,
            content: nodeContent,
            contentDigest: createContentDigest(datum)
          }
        };
        const node = Object.assign({}, datum, nodeMeta);
        createNode(node);
      });
      return;
    });
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();