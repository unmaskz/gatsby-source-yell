/* eslint-disable camelcase */
const axios = require(`axios`)
const cheerio = require(`cheerio`)

const parseResponse = (response: any, limit: any) => {
    const $ = cheerio.load(response.data)
    const reviewsDiv = $('.reviewsList');
    let reviews = [];
    for (let i = 0; i < limit; i++) {
        const reviewDiv = $(reviewsDiv).find('.review');
        let review = {
            id: '',
            author: '',
            title: '',
            content: '',
            score: '',
            createdAt: '',
        };
        review.id = reviewDiv.attr('id');
        review.author = reviewDiv.find('meta[itemprop="name"]').attr('content');
        review.title = reviewDiv.find('.review--title').text();
        review.content = reviewDiv.find('.review--content').text();
        review.score = reviewDiv.find('.starRating--value').text();
        review.createdAt = reviewDiv.find('.review--date').attr('datetime');
        
        reviews.push(review);
    }
    
    return JSON.stringify(reviews);
}
/*scrapingInstagramPosts*/
export async function scrapingYellReviews(businessId: string, limit: any) {
    return axios
    .get(`https://www.yell.com/biz/${businessId}/?version=2&showAllReviews=true#reviews`)
    .then((response: any) => {
        const reviews = parseResponse(response, limit);
        return reviews;
    })
    .catch((err: any) => {
        console.warn(`\nCould not fetch yell reviews. Error status ${err}`)
        return null
    })
}

