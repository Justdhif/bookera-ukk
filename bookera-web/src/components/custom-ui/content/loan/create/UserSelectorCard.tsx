"use client";

import { User } from "@/types/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User as UserIcon, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserSelectorCardProps {
  users: User[];
  selectedUserId: number | null;
  onSelectUser: (userId: number) => void;
  popoverOpen: boolean;
  onPopoverOpenChange: (open: boolean) => void;
}

export default function UserSelectorCard({
  users,
  selectedUserId,
  onSelectUser,
  popoverOpen,
  onPopoverOpenChange,
}: UserSelectorCardProps) {
  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <Card>
      <CardHeader>
        <Label variant="required">
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Select User
          </CardTitle>
        </Label>
        <CardDescription>User is required to create a loan</CardDescription>
      </CardHeader>
      <CardContent>
        <Popover open={popoverOpen} onOpenChange={onPopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between h-auto min-h-11"
            >
              {selectedUser ? (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">
                      {selectedUser.profile?.full_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedUser.email}
                    </div>
                  </div>
                </div>
              ) : (
                "Select User"
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-125 p-0">
            <Command>
              <CommandInput placeholder="Search user..." />
              <CommandList>
                <CommandEmpty>No user found</CommandEmpty>
                <CommandGroup>
                  {users
                    .filter((user) => user.is_active && user.role !== "admin")
                    .map((user) => (
                      <CommandItem
                        key={user.id}
                        value={`${user.profile?.full_name} ${user.email}`}
                        onSelect={() => onSelectUser(user.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedUserId === user.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.profile?.full_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
}
