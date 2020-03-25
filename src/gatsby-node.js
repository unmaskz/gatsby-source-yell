const puppeteer = require('puppeteer');

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }, { businessId }) => {
  const { createNode } = actions;

  if (!businessId || typeof businessId !== 'string') {
    throw new Error("You must supply a valid business id from yell e.g. 'company-name-73987865'");
  }

  const url = `https://www.yell.com/biz/${businessId}/?version=2&showAllReviews=true#reviews`;

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url);

    if (status === 404) {
      throw new Error(`The provided url returned a 404 page, are you sure this url is valid ${url}?`)
    }
    
    let reviewData = await page.evaluate(() => {
      let reviews = [];
      let reviewElements = document.querySelectorAll('.reviewsList .review');
      reviewElements.forEach((review) => {
        let obj = {};
        try {
          obj.id = review.getAttribute('id');
          obj.author = review.querySelector('meta[itemprop="name"]').getAttribute('content');
          obj.title = review.querySelector('.review--title').innerText();
          obj.content = review.querySelector('.review--content').innerText().replace(/\n/g, '');
          obj.score = review.querySelector('.starRating--value').innerText();
          obj.createdAt = review.querySelector('.review--date').getAttribute('datetime');
        } catch (exception) {
          console.log(`Looping through reviews error: ${exception}`);
        }
        reviews.push(obj);
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
      return reviews;
    });

  } catch (err) {
    console.error(`Error while attempting to fetch site: ${err.name}: ${err.message}`)
  }
  return
};
