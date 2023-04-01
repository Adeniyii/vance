import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { SignInButton, useUser, UserButton } from "@clerk/nextjs";
import { api, type RouterOutputs } from "~/utils/api";
import { type ComponentProps } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);


type PostWithUser = RouterOutputs["posts"]["getAll"][number]

const PostView = ({ post }: { post: PostWithUser } & ComponentProps<"div">) => (
  <div className="px-4 py-10 flex border-b border-dashed border-neutral-500" key={post.id}>
    <h1 className="mr-auto">{post.content}</h1>
    <div className="flex items-center">
      <div className="relative w-5 h-5 rounded-full overflow-hidden mr-2">
        <Image src={post.author.profileImageUrl} alt={`Profile image of ${post.author.firstName || 'shadow'}`} fill />
      </div>
      <span className="text-xs font-light">{post.author.firstName || 'shadow'}</span>
      <span className="mx-1">-</span>
      <span className="text-xs font-bold">{dayjs(post.updatedAt).fromNow()}</span>
    </div>
  </div>
)

const Home: NextPage = () => {
  const { data } = api.posts.getAll.useQuery();
  const { isLoaded, isSignedIn } = useUser()

  return (
    <>
      <Head>
        <title>Vance</title>
        <meta name="description" content="Vamvagarrrr" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-full flex-col border border-dashed border-neutral-500 md:max-w-2xl mx-auto">
        <header className="flex items-center p-4 border-b border-dashed border-neutral-500">
          <div className="ml-auto">{(!isLoaded || !isSignedIn) ? <SignInButton /> : <UserButton />}</div>
        </header>

        <div className="p-4 border-b border-dashed border-neutral-500 flex justify-center">
          <input type="text" placeholder="Enter an emoji" className="form-input outline-none w-full max-w-lg bg-transparent border border-dashed border-neutral-500" />
        </div>

        {data?.map((post) => (
          <PostView key={post.id} post={post} />
        ))}
      </main>
    </>
  );
};

export default Home;
