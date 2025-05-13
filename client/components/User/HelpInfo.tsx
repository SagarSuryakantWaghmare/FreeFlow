import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, AlertTriangle, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HelpInfoProps {
  className?: string;
}

const HelpInfo: React.FC<HelpInfoProps> = ({ className }) => {
  return (    <Card className={`${className} max-h-full bg-white dark:bg-zinc-900`}>
      <CardContent className="pt-3 sm:pt-6 max-h-[calc(100vh-10rem)] overflow-auto px-2 sm:px-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">            <AccordionTrigger className="text-xs sm:text-sm font-medium flex items-center py-2 sm:py-4 text-slate-900 dark:text-white">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-600 dark:text-purple-400" />
              How P2P Messaging Works
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                FreeFlow uses WebRTC technology to create direct, encrypted connections between
                browsers. Messages travel directly from your device to your contact's device,
                without passing through any central servers.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Our signaling server only helps establish the initial connection, but does not
                process or store your messages.
              </p>            </AccordionContent>
          </AccordionItem>
            <AccordionItem value="item-2">
            <AccordionTrigger className="text-xs sm:text-sm font-medium flex items-center py-2 sm:py-4 text-slate-900 dark:text-white">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-600 dark:text-purple-400" />
              Privacy & Security
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                All messages are end-to-end encrypted, meaning only you and your contact can
                read them. We cannot access your messages even if we wanted to.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Messages are now stored locally in your browser to maintain conversations between page refreshes,
                but are automatically cleared when you log out for privacy.
              </p>            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-new">
            <AccordionTrigger className="text-xs sm:text-sm font-medium flex items-center py-2 sm:py-4 text-slate-900 dark:text-white">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-600 dark:text-purple-400" />
              Persistent Chat
            </AccordionTrigger>
            <AccordionContent><p className="text-sm text-muted-foreground mb-2">
                <strong>✨ New Feature:</strong> Your chat messages now persist between page refreshes 
                and browser restarts, so you won't lose your conversations accidentally.
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                When you reconnect with someone, any messages sent while you were offline will be
                automatically synchronized, ensuring you don't miss any part of the conversation.
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Chat history is stored locally in your browser, and will only be cleared when you 
                log out using the Logout button, for your privacy.
              </p>
              <p className="text-sm text-muted-foreground">
                For maximum privacy, always log out when using a shared or public computer.
              </p>
            </AccordionContent>          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-xs sm:text-sm font-medium flex items-center py-2 sm:py-4 text-slate-900 dark:text-white">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-amber-600 dark:text-yellow-500" />
              Troubleshooting
            </AccordionTrigger>
            <AccordionContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>
                  <strong>Can't see other users?</strong> Make sure you're connected to the
                  internet and the server status shows "Connected."
                </li>
                <li>
                  <strong>Messages not sending?</strong> Ensure you've established a connection with
                  the user first by clicking on their name and waiting for the "Connected" status.
                </li>
                <li>
                  <strong>Connection issues?</strong> Try refreshing the page or signing out and back in.
                  Some networks (especially corporate networks) may block WebRTC connections.
                </li>
                <li>
                  <strong>Missing chat history?</strong> If you logged out previously, your chat history
                  was cleared for privacy. Your messages are stored only until you log out.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default HelpInfo;
