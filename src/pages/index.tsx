import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { SignInButton, useUser, UserButton } from "@clerk/nextjs";
import { api, type RouterOutputs } from "~/utils/api";
import { useRef, type ComponentProps } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Spinner from "~/ui/Spinner"
import { toast } from 'sonner';
import EmptyState from "~/ui/EmptyState";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number]

const PostView = ({ post, ...props }: { post: PostWithUser } & ComponentProps<"div">) => (
  <div className="px-4 h-20 items-center flex border-b border-dashed border-neutral-500" {...props}>
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

const Feed = () => {
  const { data, isLoading: isLoadingPosts, isError } = api.posts.getAll.useQuery(undefined, {
    retry: false, refetchOnWindowFocus: false, onError: (err) => {
      toast.error(err.message)
    }});

  if (isLoadingPosts) {
    return (
      <div className="grid place-content-center p-32">
        <Spinner />
      </div>
    )
  }

  if (isError || !data || data.length === 0){
    return (
      <div className="grid place-content-center p-32">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      {data?.map((post) => (
        <PostView key={post.id} post={post} />
      ))}
    </div>
  );
}

const EmojiInput = () => {
  const emojiRef = useRef<HTMLInputElement | null>(null)
  const ctx = api.useContext()

  const { mutate, isLoading: isEmojing } = api.posts.create.useMutation({
    onSuccess: () => {
      toast.success("Posted! Now go away.. seriously, you're rate limited.")
      void ctx.posts.getAll.invalidate()
    },
    onError: (err) => {
      const errorMsg = err.data?.zodError?.fieldErrors.content
      if (errorMsg && errorMsg[0]) {
        return toast.error(errorMsg[0])
      }
      toast.error("Couldn't post. Not my fault, try again.")
    }
  })

  return (
    <div className="p-4 flex justify-center gap-3 items-center">
      <input
        type="text"
        ref={emojiRef}
        placeholder="Enter an emoji"
        className="form-input outline-none w-full max-w-lg bg-transparent border border-dashed border-neutral-500"
      />
      <button
        type="button"
        disabled={isEmojing}
        onClick={() => mutate({ content: emojiRef.current?.value || "" })}
        className="rounded-lg text-sm p-2.5 text-center inline-flex items-center mr-2 text-white bg-gradient-to-br from-purple-600 to-blue-500 cursor-pointer hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-500 font-medium disabled:cursor-not-allowed">
        {!isEmojing && <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>}
        {isEmojing && <Spinner className="w-5 h-5" />}
        <span className="sr-only">Post your emoji</span>
      </button>
    </div>
  )
}

const Home: NextPage = () => {
  const { isLoaded, isSignedIn } = useUser()

  return (
    <>
      <Head>
        <title>Vance</title>
        <meta name="description" content="Vamvagarrrr" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-full flex-col border border-dashed border-neutral-500 md:max-w-2xl mx-auto">
        <header className="flex items-center h-16 px-4">
          <div className="ml-auto">{!isLoaded ? <div className="h-9 rounded-full bg-neutral-700 w-9 aspect-square animate-pulse"></div> : isSignedIn ? <UserButton /> : <SignInButton />}</div>
        </header>

        <EmojiInput />

        <Feed />
      </main>
    </>
  );
};

export default Home;
