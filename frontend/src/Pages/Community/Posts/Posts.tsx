import React, { useEffect, useState } from "react";
import classes from "./Posts.module.css";
import Post from "./Post";
import useHttp, { COMMON_URL } from "../../../hooks/use-http";

const Posts = (props: {
  selectedCategories: string[];
  search?: string;
  community?: any;
  projects?: any;
}) => {
  const [httpInfo, sendHttpRequest] = useHttp();
  const [posts, setPosts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const search = props.search ?? "";

  useEffect(() => {
    // Ignore answers to older requests that arrive after a newer one was sent
    let current = true;
    const query = new URLSearchParams({ tags: JSON.stringify(props.selectedCategories) });
    if (search) query.set("search", search);
    const fetchProjects = async () => {
      const projects = await sendHttpRequest({
        url: `${COMMON_URL}/art/shared-projects?${query}`,
        headers: { "Content-Type": "application/json" },
        method: "GET",
      });
      if (!current) return;
      // A failed request resolves to undefined; keep the page up and show the error
      setPosts(Array.isArray(projects) ? projects : []);
      setLoaded(true);
    };
    fetchProjects();
    return () => {
      current = false;
    };
  }, [sendHttpRequest, props.selectedCategories, search]);

  return (
    <div className={`${classes["posts-holder"]}`}>
      {httpInfo.error && (
        <p className={classes.error}>
          Could not load the community posts. Try again later.
        </p>
      )}
      {loaded && !httpInfo.error && !httpInfo.isLoading && posts.length === 0 && (
        <p className={classes.error}>
          {search || props.selectedCategories.length > 0
            ? "No shared projects match your search or tags. Try fewer tags or other words."
            : "No one has shared a project yet."}
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
