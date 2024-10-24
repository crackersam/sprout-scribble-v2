"use client";

import React from "react";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const Socials = () => {
  return (
    <div className="flex flex-col w-full items-center gap-4">
      <Button
        className="flex gap-4 w-full"
        variant={"outline"}
        onClick={() => signIn("google", { redirect: false })}
      >
        <p>Sign in with Google</p> <FcGoogle className="w-5 h-5" />
      </Button>
      <Button
        className="flex gap-4 w-full"
        variant={"outline"}
        onClick={() => signIn("github", { redirect: false })}
      >
        <p>Sign in with GitHub</p> <FaGithub className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Socials;
