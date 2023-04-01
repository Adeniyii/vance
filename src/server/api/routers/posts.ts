import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { pick } from "~/utils/helpers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { REDIS_KEY } from "~/utils/constants";
import { type User } from "@clerk/nextjs/dist/api";
import { type Post } from "@prisma/client";

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    let posts: Post[];
    let users: User[];

    try {
      posts = await ctx.prisma.post.findMany({ take: 100, orderBy: { createdAt: "desc" } });
      users = await clerkClient.users.getUserList({userId: posts.map(post => post.authorId), limit: 100});
    } catch(err) {
      throw new TRPCError({message: "Something went wrong", code: "INTERNAL_SERVER_ERROR"})
    }

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

  create: privateProcedure.input(z.object({ content: z.string().emoji("I know you know what an emoji is.").min(1).max(255) })).mutation(async ({ ctx, input }) => {
    // Create a new ratelimiter, that allows 3 requests per 1 minute
    const ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, "1 m"),
      analytics: true,
      /**
       * Optional prefix for the keys used in redis. This is useful if you want to share a redis
       * instance with other applications and want to avoid key collisions. The default prefix is
       * "@upstash/ratelimit"
       */
      prefix: REDIS_KEY,
    });

    const { success } = await ratelimit.limit(ctx.currentUserId);

    if (!success) {
      throw new TRPCError({
        message: "Chill out cowboy, that's too many requests",
        code: "TOO_MANY_REQUESTS",
      });
    }

    const post = await ctx.prisma.post.create({
      data: {
        content: input.content,
        authorId: ctx.currentUserId,
      },
    });

    return post;
  })
});
