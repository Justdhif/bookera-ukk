"use client";
import { useTranslations } from "next-intl";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserSelectorCardProps {
  users: User[];
  selectedUserId: number | null;
  onSelectUser: (userId: number) => void;
  popoverOpen: boolean;
  onPopoverOpenChange: (open: boolean) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
}

export default function UserSelectorCard({
  users,
  selectedUserId,
  onSelectUser,
  popoverOpen,
  onPopoverOpenChange,
  hasMore,
  onLoadMore,
  isLoading,
}: UserSelectorCardProps) {
  const t = useTranslations("borrow");
  const tCommon = useTranslations("common");
  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <Card>
      <CardHeader>
        <Label variant="required">
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            {t("selectUserTitle")}
          </CardTitle>
        </Label>
        <CardDescription>{t("userSelectionDesc")}</CardDescription>
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
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={selectedUser.profile?.avatar || undefined}
                      alt={selectedUser.profile?.full_name || "User"}
                      className="object-cover"
                    />
                    <AvatarFallback>{selectedUser.profile?.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
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
                t("selectUserTitle")
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-125 p-0">
            <Command>
              <CommandInput placeholder={t("searchUserPlaceholder")} />
              <CommandList>
                <CommandEmpty>{tCommon("noUserFound")}</CommandEmpty>
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
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.profile?.avatar || undefined}
                              alt={user.profile?.full_name || "User"}
                              className="object-cover"
                            />
                            <AvatarFallback>{user.profile?.full_name?.[0] || "U"}</AvatarFallback>
                          </Avatar>
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
                {hasMore && (
                  <div className="p-2 border-t mt-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        onLoadMore();
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? tCommon("loading") : tCommon("loadMore")}
                    </Button>
                  </div>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
}
