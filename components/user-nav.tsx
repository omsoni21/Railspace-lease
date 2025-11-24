
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Shield, CreditCard, FileCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export function UserNav({ isAdmin }: { isAdmin?: boolean }) {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (isAdmin) {
        setUserName("Admin");
        setUserEmail("admin@railspace.com");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "User");
          setUserEmail(user.email || "user@example.com");
        }
      }
    };

    loadUser();
  }, [isAdmin]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`/avatars/${isAdmin ? '01' : '02'}.png`} alt={userName} />
            <AvatarFallback>
              {isAdmin ? <Shield /> : <User />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profile" passHref>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
           <Link href="/payments" passHref>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Payments</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/verify-documents" passHref>
            <DropdownMenuItem>
              <FileCheck className="mr-2 h-4 w-4" />
              <span>Verify Documents</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
