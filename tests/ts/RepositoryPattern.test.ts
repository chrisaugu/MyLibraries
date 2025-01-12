import { describe, expect, test } from "@jest/globals";
import { InMemoryPostRepository, Post } from "@/DesignPatterns/Repository";

const postRepo = new InMemoryPostRepository();
let post = new Post(1, "Hello World");

describe("testing Repository Pattern", () => {
  test("create post should return 'Hello World'", () => {
    postRepo.createPost(post)
    console.log("Post created successfully: ", post)
    expect(post.text).toBe("Hello World");
  });

  test("should return post length of 1", () => {
    let posts = postRepo.getPosts();
    console.log("Posts retrieved successfully: ", posts)
    expect(posts.length).toBe(1);
  });

  test("should return the content of post with id 1", () => {
    let post = postRepo.getPost(1)
    console.log("Post retrieved successfully: ", post)
    expect(post).toEqual({ id: 1, text: "Hello World", userId: 1 });
  });

  test("should update post's text to 'Hello World!'", () => {
    postRepo.updatePost(1, new Post(1, "Hello World!"))
    let updatedPost = postRepo.getPost(1)
    console.log("Post updated successfully: ", updatedPost)
    expect(updatedPost).toEqual({ id: 1, text: "Hello World!", userId: 1 });
  });

  test("should remove post from datastore and return post lenght of 0", () => {
    postRepo.deletePost(1)
    let posts = postRepo.getPosts();
    console.log("Posts deleted successfully: ", posts)
    expect(posts.length).toBe(0);
  });
});
