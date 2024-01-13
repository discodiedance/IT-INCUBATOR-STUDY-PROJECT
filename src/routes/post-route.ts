import { Router, Response } from "express";
import { PostRepository } from "../repositories/post-repository";
import { authMiddleware } from "../middlewares/auth/auth-middleware";
import {
  Params,
  RequestWithBodyAndParams,
  RequestWithParams,
  RequestWithBody,
  RequestTypeWithQuery,
  RequestWithBodyAndBlog,
  PostIdParams,
  RequestTypeWithQueryPostId,
  RequestWithCommentBodyAndParams,
} from "../types/common";
import { PostBody } from "../types/post/input";
import { postValidation } from "../middlewares/post/post-validation";
import { OutputPostType } from "../types/post/output";
import { QueryPostRepository } from "../repositories/query-repository/query-post-repository";
import { BlogSortDataType } from "../types/blog/input";
import {
  CommentBody,
  CommentSortDataType,
  CommentType,
} from "../types/comment/input";
import { PostService } from "../domain/post-service";
import { QueryBlogRepository } from "../repositories/query-repository/query-blog-repository";
import { commentValidation } from "./../middlewares/comment/comment-validation";
import { QueryCommentRepository } from "../repositories/query-repository/query-comment-repository";
import { authTokenMiddleware } from "../middlewares/auth/auth-token-middleware";
import { CommentService } from "../domain/comment-service";

export const postRoute = Router({});

postRoute.get(
  "/",
  async (req: RequestTypeWithQuery<BlogSortDataType>, res: Response) => {
    const sortData = {
      searchNameTerm: req.query.searchNameTerm,
      sortBy: req.query.sortBy,
      sortDirection: req.query.sortDirection,
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
    };
    const posts = await QueryPostRepository.getAllPosts(sortData);

    return res.send(posts);
  }
);

postRoute.get("/:id", async (req: RequestWithParams<Params>, res: Response) => {
  const id = req.params.id;
  const post = await QueryPostRepository.getPostById(id);

  if (!post) {
    res.sendStatus(404);
    return;
  }

  res.send(post);
});

postRoute.get(
  "/:postId/comments",
  async (req: RequestWithParams<Params>, res: Response) => {
    const id = req.params.id;
    const comment = await QueryCommentRepository.getCommentById(id);

    if (!comment) {
      res.sendStatus(404);
      return;
    }

    res.send(comment);
  }
);

postRoute.post(
  "/",
  authMiddleware,
  postValidation(),
  async (req: RequestWithBodyAndBlog<OutputPostType>, res: Response) => {
    const blog = await QueryBlogRepository.getBlogById(req.body.blogId);
    if (!blog) {
      res.sendStatus(404);
      return;
    }

    const post = await PostService.createPost({
      ...req.body,
      blogName: blog.name,
    });

    return res.status(201).send(post);
  }
);

postRoute.post(
  "/:postId/comments",
  authTokenMiddleware,
  commentValidation(),
  async (
    req: RequestWithCommentBodyAndParams<PostIdParams, CommentBody>,
    res: Response
  ) => {
    const user = req.user;
    if (!user) {
      res.sendStatus(401);
      return;
    }

    const post = await QueryPostRepository.getPostById(req.query.postId);
    if (!post) {
      res.sendStatus(404);
      return;
    }

    const comment = await PostService.createCommentToPost(
      req.query.postId,
      req.body.content,
      req.body.commentatorInfo.userId,
      req.body.commentatorInfo.userLogin
    );
    return res.sendStatus(201).send(comment);
  }
);

postRoute.put(
  "/:id",
  authMiddleware,
  postValidation(),
  async (req: RequestWithBodyAndParams<Params, PostBody>, res: Response) => {
    const id = req.params.id;
    let post: OutputPostType | null = await QueryPostRepository.getPostById(id);
    let { title, shortDescription, content, blogId } = req.body;

    if (!post) {
      res.sendStatus(404);
      return;
    }

    (post.title = title),
      (post.shortDescription = shortDescription),
      (post.content = content),
      (post.blogId = blogId);
    await PostRepository.updatePost(id, post);
    return res.sendStatus(204);
  }
);

postRoute.delete(
  "/:id",
  authMiddleware,
  async (req: RequestWithParams<Params>, res: Response) => {
    const id = req.params.id;

    const status = await PostRepository.deletePost(id);

    if (status == false) {
      res.sendStatus(404);
      return;
    }
    return res.sendStatus(204);
  }
);
