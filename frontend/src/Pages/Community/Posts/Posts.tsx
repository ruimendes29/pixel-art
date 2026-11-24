import React, { useEffect, useState } from "react";
import classes from "./Posts.module.css";
import Post from "./Post";
import useHttp, { COMMON_URL } from "../../../hooks/use-http";

const Posts = (props: {
  selectedCategories: string[];
  community?: any;
  projects?: any;
}) => {
  const [httpInfo, sendHttpRequest] = useHttp();
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const projects = await sendHttpRequest({
        url: `${COMMON_URL}/art/shared-projects?tags=${JSON.stringify(
          props.selectedCategories
        )}`,
        headers: { "Content-Type": "application/json" },
        method: "GET",
      });
      // A failed request resolves to undefined; keep the page up and show the error
      setPosts(Array.isArray(projects) ? projects : []);
    };
    fetchProjects();
  }, [sendHttpRequest, props.selectedCategories]);

  return (
    <div className={`${classes["posts-holder"]}`}>
      {httpInfo.error && (
        <p className={classes.error}>
          Could not load the community posts. Try again later.
        </p>
      )}
      {posts.map((el: any) => (
        <Post
          authorId={el.author}
          postDescription={el.description}
          postId={el.id}
          postLikes={el.likes}
          postName={el.name}
          key={el.id}
        />
      ))}
    </div>
  );
};

export default Posts;
