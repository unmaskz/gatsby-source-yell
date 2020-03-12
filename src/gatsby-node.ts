import _ from 'lodash';
import { scrapingYellReviews } from './yell'; 
import * as dotenv from 'dotenv';

dotenv.config();
const businessId = process.env.BUSINESS_ID;
const limit = process.env.LIMIT || 5;

async function getYellReviews() {
    if(businessId !== undefined) {
        let data = await scrapingYellReviews(businessId, limit);
        return data;
    } else {
        console.warn('No businessId is defined.')
        return null;
    }
}

function processDatum(datum: any) {
    return {
        id: datum.id,
        parent: `__SOURCE__`,
        internal: {
            type: `YellReviewNode`,
        },
        children: [],
        author: datum.author,
        title: datum.title,
        content: datum.content,
        score: datum.score,
        createdAt: datum.createdAt,
    }
}

exports.sourceNodes = async ({ actions }: any) => {
    const { createNode } = actions;
    let data = await getYellReviews();
    if (data) {
        return Promise.all(
            data.forEach((datum: any) => createNode(processDatum(datum))),
        );
    }
    return;
}