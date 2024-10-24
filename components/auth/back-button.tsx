"use client";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

const BackButton = ({ href, label }: { href: string; label: string }) => {
  return (
    <Button asChild variant={"link"} className="font-medium w-full">
      <Link href={href} aria-label={label}>
        {label}
      </Link>
    </Button>
  );
};

export default BackButton;
