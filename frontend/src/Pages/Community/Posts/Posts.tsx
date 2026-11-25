import React, { useEffect, useState } from "react";
import card from "../../../components/UI/ArtCard.module.css";
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
    const query = new URLSearchParams({
      tags: JSON.stringify(props.selectedCategories),
    });
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
    <div className={`${card.grid} ${classes["posts-holder"]}`}>
      {httpInfo.error && (
        <div className={card.empty}>
          <h2>Could not load the community posts</h2>
          <p>The server did not answer. Reload the page to try again.</p>
        </div>
      )}
      {loaded &&
        !httpInfo.error &&
        !httpInfo.isLoading &&
        posts.length === 0 && (
          <div className={card.empty}>
            {search || props.selectedCategories.length > 0 ? (
              <>
                <h2>No shared projects match your search or tags</h2>
                <p>Try fewer tags or other words.</p>
              </>
            ) : (
              <>
                <h2>Nothing shared yet</h2>
                <p>
                  Open a project and choose Share to community to be the first.
                </p>
              </>
            )}
          </div>
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
