import { genImageUrl } from "../utils/helper.js"; 

class newAPiTransform {
    static transform(news){
        return {
            id: news.id,
            title: news.title,
            content:news.content,
            image: genImageUrl(news.image),
            createdAt: news.createdAt,
            updatedAt: news.updatedAt,
            reporter: {
                id: news?.user.id,
                name: news?.user.name,
                profile: news?.user.profile != null ? genImageUrl(news?.user.profile) : 'no image',
            }
        }
    }
}

export default newAPiTransform