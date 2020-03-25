const fetch = require('node-fetch');
const cheerio = require('cheerio');

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest
}, {
  businessId
}) => {
  const {
    createNode
  } = actions;

  if (!businessId || typeof businessId !== 'string') {
    throw new Error("You must supply a valid business id from yell e.g. 'company-name-73987865'");
  }

  const url = `https://www.yell.com/biz/${businessId}/`;

  try {
    const response = await fetch(url)
    const status = await response.status
    const body = await response.text()

    if (status === 404) {
      throw new Error(`The provided url returned a 404 page, are you sure this url is valid ${url}?`)
    }
    const $ = cheerio.load(body)

    let reviews = [];
    $('.reviewsList .review').each(function () {
      let review = {
        id: '',
        author: '',
        title: '',
        content: '',
        score: '',
        createdAt: '',
      };
      review.id = $(this).attr('id');
      review.author = $(this).find('meta[itemprop="name"]').attr('content');
      review.title = $(this).find('.review--title').text();
      review.content = $(this).find('.review--content').text().replace(/\n/g, '');
      review.score = $(this).find('.starRating--value').text();
      review.createdAt = $(this).find('.review--date').attr('datetime');

      reviews.push(review);
    });
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
  } catch (err) {
    console.error(`Error while attempting to fetch site: ${err.name}: ${err.message}`)
  }
  return
};
