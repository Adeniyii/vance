import { clerkClient } from "@clerk/nextjs/server";
// import { z } from "zod";
import { pick } from "~/utils/helpers";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany();
    const users = await clerkClient.users.getUserList({userId: posts.map(post => post.authorId)});

    const postWithUsers = posts.map(post => {
      const user = users.find(user => user.id === post.authorId);
      if (!user) {
        throw new TRPCError({message: "Author not found", code: "INTERNAL_SERVER_ERROR"})
      }

      return {
        ...post,
        author: pick(user, ["id", "firstName", "lastName", "emailAddresses", "profileImageUrl"]),
      }
    })

    return postWithUsers;
  }),
});
