"use client";

import { useState } from "react";
import { User, getDisplayName } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Search, Check } from "lucide-react";

interface NewChatSectionProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: User[];
  onSelectContact: (contact: User) => void;
  onCreateGroup?: (name: string, members: User[]) => void;
}

export function NewChatSection({
  isOpen,
  onClose,
  contacts,
  onSelectContact,
  onCreateGroup,
}: NewChatSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);

  const filteredContacts = contacts.filter((contact) =>
    getDisplayName(contact).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSelectContact = (contact: User) => {
    if (isGroupMode) {
      setSelectedMembers((prev) =>
        prev.find((m) => m.id === contact.id)
          ? prev.filter((m) => m.id !== contact.id)
          : [...prev, contact]
      );
    } else {
      onSelectContact(contact);
      onClose();
    }
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      onCreateGroup?.(groupName, selectedMembers);
      onClose();
      setGroupName("");
      setSelectedMembers([]);
      setIsGroupMode(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isGroupMode ? "New Group" : "New Chat"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={!isGroupMode ? "default" : "secondary"}
              size="sm"
              onClick={() => setIsGroupMode(false)}>
              Direct Message
            </Button>
            <Button
              variant={isGroupMode ? "default" : "secondary"}
              size="sm"
              onClick={() => setIsGroupMode(true)}>
              Create Group
            </Button>
          </div>

          {/* Group Name Input */}
          {isGroupMode && (
            <Input
              placeholder="Group name"
              value={groupName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setGroupName(e.target.value)
              }
            />
          )}

          {/* Selected Members */}
          {isGroupMode && selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-1 pr-2 text-sm text-primary">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={member.avatar ?? undefined}
                      alt={getDisplayName(member)}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(getDisplayName(member))}
                    </AvatarFallback>
                  </Avatar>
                  <span>{getDisplayName(member)}</span>
                  <button
                    onClick={() =>
                      setSelectedMembers((prev) =>
                        prev.filter((m) => m.id !== member.id)
                      )
                    }
                    className="ml-1 cursor-pointer rounded-full p-0.5 hover:bg-primary/20">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              className="pl-10"
            />
          </div>

          {/* Contact List */}
          <ScrollArea className="h-60">
            {filteredContacts.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No contacts found
              </p>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedMembers.find(
                  (m) => m.id === contact.id
                );
                return (
                  <button
                    key={contact.id}
                    onClick={() => handleSelectContact(contact)}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors ${
                      isSelected ? "bg-accent" : "hover:bg-accent/50"
                    }`}>
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={contact.avatar ?? undefined}
                          alt={getDisplayName(contact)}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(getDisplayName(contact))}
                        </AvatarFallback>
                      </Avatar>
                      {contact.status === "online" && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground">
                        {getDisplayName(contact)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{contact.username}
                      </p>
                    </div>
                    {isGroupMode && (
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        }`}>
                        {isSelected && (
                          <Check
                            className="h-3 w-3 text-primary-foreground"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </ScrollArea>

          {/* Create Group Button */}
          {isGroupMode && (
            <Button
              className="w-full"
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedMembers.length === 0}>
              Create Group ({selectedMembers.length} members)
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
