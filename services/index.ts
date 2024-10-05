import { request, gql } from "graphql-request";

const graphqlAPI: any = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;

type Author = {
  bio: string;
  name: string;
  id: string;
  photo: {
    url: string;
  };
};

type Category = {
  name: string;
  slug: string;
};

type Post = {
  author: Author;
  createdAt: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: {
    url: string;
  };
  categories: Category[];
};

type GetPostsResponse = {
  postsConnection: {
    edges: {
      cursor: string;
      node: Post;
    }[];
  };
};

export const getPosts = async () => {
  const query = gql`
    query MyQuery {
      postsConnection {
        edges {
          node {
            author {
              name
              bio
              id
              photo {
                url
              }
            }
            createdAt
            slug
            title
            excerpt
            featuredImage {
              url
            }
            category {
              name
              slug
            }
          }
        }
      }
    }
  `;

  const results: any = await request(graphqlAPI!, query);

  return results.postsConnection.edges;
};

type GetCategoriesResponse = {
  categories: Category[];
};

export const getCategories = async (): Promise<Category[]> => {
  const query = gql`
    query GetCategories {
      categories {
        name
        slug
      }
    }
  `;

  const result: GetCategoriesResponse = await request(graphqlAPI, query);
  return result.categories;
};

type PostDetails = {
  title: string;
  excerpt: string;
  featuredImage: {
    url: string;
  };
  author: Author;
  createdAt: string;
  slug: string;
  content: {
    raw: any;
  };
  categories: Category[];
};

type GetPostDetailsResponse = {
  post: PostDetails;
};

export const getPostDetails = async (slug: string) => {
  if (!slug || typeof slug !== "string") {
    throw new Error("Invalid slug provided");
  }

  const query = gql`
    query GetPostDetails($slug: String!) {
      post(where: { slug: $slug }) {
        title
        slug
        excerpt
        featuredImage {
          url
        }
        author {
          name
          bio
          photo {
            url
          }
        }
        createdAt
        slug
        content {
          raw
        }
        category {
          name
          slug
        }
      }
    }
  `;

  // const query = gql`
  //   query GetPostDetails($slug: String!) {
  //     post(where: { slug: $slug }) {
  //       title
  //       excerpt
  //       featuredImage {
  //         url
  //       }
  //       author {
  //         name
  //         bio
  //         photo {
  //           url
  //         }
  //       }
  //       createdAt
  //       slug
  //       content {
  //         raw
  //       }
  //       categories {
  //         name
  //         slug
  //       }
  //     }
  //   }
  // `;

  try {
    const result: any = await request(graphqlAPI, query, { slug });
    return result?.post || null; // Return null if post is not found
  } catch (error: any) {
    console.error("Error fetching post details:", error);
    throw new Error(`Failed to fetch post details: ${error.message}`);
  }
};

type SimilarPost = {
  title: string;
  featuredImage: {
    url: string;
  };
  createdAt: string;
  slug: string;
};

type GetSimilarPostsResponse = {
  posts: SimilarPost[];
};

export const getSimilarPosts = async (
  categories: string[],
  slug: string
): Promise<SimilarPost[]> => {
  const query = gql`
    query GetSimilarPosts($slug: String!, $categories: [String!]) {
      posts(
        where: {
          slug_not: $slug
          AND: { category_some: { slug_in: $categories } }
        }
        last: 3
      ) {
        title
        featuredImage {
          url
        }
        createdAt
        slug
      }
    }
  `;

  try {
    const result: GetSimilarPostsResponse = await request(graphqlAPI, query, {
      slug,
      categories,
    });
    return result.posts;
  } catch (error: any) {
    console.error("Error fetching similar posts:", error);
    throw new Error(`Failed to fetch similar posts: ${error.message}`);
  }
};

type AdjacentPost = {
  title: string;
  featuredImage: {
    url: string;
  };
  createdAt: string;
  slug: string;
};

type GetAdjacentPostsResponse = {
  next: AdjacentPost[];
  previous: AdjacentPost[];
};

export const getAdjacentPosts = async (
  createdAt: string,
  slug: string
): Promise<{ next: AdjacentPost | null; previous: AdjacentPost | null }> => {
  const query = gql`
    query GetAdjacentPosts($createdAt: DateTime!, $slug: String!) {
      next: posts(
        first: 1
        orderBy: createdAt_ASC
        where: { slug_not: $slug, AND: { createdAt_gte: $createdAt } }
      ) {
        title
        featuredImage {
          url
        }
        createdAt
        slug
      }
      previous: posts(
        first: 1
        orderBy: createdAt_DESC
        where: { slug_not: $slug, AND: { createdAt_lte: $createdAt } }
      ) {
        title
        featuredImage {
          url
        }
        createdAt
        slug
      }
    }
  `;

  const result: GetAdjacentPostsResponse = await request(graphqlAPI, query, {
    slug,
    createdAt,
  });
  return {
    next: result.next[0] || null,
    previous: result.previous[0] || null,
  };
};

// export const getCategoryPost = async (slug) => {
//   const query = gql`
//     query GetCategoryPost($slug: String!) {
//       postsConnection(where: { categories_some: { slug: $slug } }) {
//         edges {
//           cursor
//           node {
//             author {
//               bio
//               name
//               id
//               photo {
//                 url
//               }
//             }
//             createdAt
//             slug
//             title
//             excerpt
//             featuredImage {
//               url
//             }
//             categories {
//               name
//               slug
//             }
//           }
//         }
//       }
//     }
//   `;

//   const result = await request(graphqlAPI, query, { slug });

//   return result.postsConnection.edges;
// };
export const getCategoryPost = async (slug: string): Promise<Post[]> => {
  const query = gql`
    query GetCategoryPost($slug: String!) {
      postsConnection(where: { category_some: { slug: $slug } }) {
        edges {
          cursor
          node {
            author {
              bio
              name
              id
              photo {
                url
              }
            }
            createdAt
            slug
            title
            excerpt
            featuredImage {
              url
            }
            category {
              name
              slug
            }
          }
        }
      }
    }
  `;

  const result: any = await request(graphqlAPI, query, { slug });
  return result.postsConnection.edges;
};

type FeaturedPost = {
  author: {
    name: string;
    photo: {
      url: string;
    };
  };
  featuredImage: {
    url: string;
  };
  title: string;
  slug: string;
  createdAt: string;
};

type GetFeaturedPostsResponse = {
  posts: FeaturedPost[];
};

export const getFeaturedPosts = async (): Promise<FeaturedPost[]> => {
  const query = gql`
    query GetFeaturedPosts {
      posts(where: { featuredPost: true }) {
        author {
          name
          photo {
            url
          }
        }
        featuredImage {
          url
        }
        title
        slug
        createdAt
      }
    }
  `;

  const result: GetFeaturedPostsResponse = await request(graphqlAPI, query);
  return result.posts;
};

export const submitComment = async (obj: any) => {
  const result = await fetch("/api/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
  });

  return result.json();
};

type Comment = {
  name: string;
  createdAt: string;
  comment: string;
};

type GetCommentsResponse = {
  comments: Comment[];
};

export const getComments = async (slug: string): Promise<Comment[]> => {
  const query = gql`
    query GetComments($slug: String!) {
      comments(where: { post: { slug: $slug } }) {
        name
        createdAt
        comment
      }
    }
  `;

  try {
    const result: GetCommentsResponse = await request(graphqlAPI, query, {
      slug,
    });
    return result.comments;
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    throw new Error(`Failed to fetch comments: ${error.message}`);
  }
};

export const getRecentPosts = async (): Promise<SimilarPost[]> => {
  const query = gql`
    query GetRecentPosts {
      posts(orderBy: createdAt_ASC, last: 3) {
        title
        featuredImage {
          url
        }
        createdAt
        slug
      }
    }
  `;

  const result: GetSimilarPostsResponse = await request(graphqlAPI, query);
  return result.posts;
};
