import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, useUser, UserButton, SignOutButton } from "@clerk/nextjs";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { data } = api.posts.getAll.useQuery();
  const { user, isLoaded, isSignedIn } = useUser()


  return (
    <>
      <Head>
        <title>Vance</title>
        <meta name="description" content="Vamvagarrrr" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        {(!isLoaded || !isSignedIn) ? <SignInButton /> : <SignOutButton /> }

        {data?.map((post) => (
          <div key={post.id}>
            <h1>{post.content}</h1>
          </div>
        ))}
      </main>
    </>
  );
};

export default Home;
