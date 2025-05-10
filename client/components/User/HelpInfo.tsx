import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface HelpInfoProps {
  className?: string;
}

const HelpInfo: React.FC<HelpInfoProps> = ({ className }) => {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-sm font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2 text-whisper-purple" />
              How P2P Messaging Works
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-2">
                FreeFlow uses WebRTC technology to create direct, encrypted connections between
                browsers. Messages travel directly from your device to your contact's device,
                without passing through any central servers.
              </p>
              <p className="text-sm text-muted-foreground">
                Our signaling server only helps establish the initial connection, but does not
                process or store your messages.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-sm font-medium flex items-center">
              <Lock className="h-4 w-4 mr-2 text-whisper-purple" />
              Privacy & Security
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-2">
                All messages are end-to-end encrypted, meaning only you and your contact can
                read them. We cannot access your messages even if we wanted to.
              </p>
              <p className="text-sm text-muted-foreground">
                Messages are not stored on any servers and disappear when the conversation ends.
                For maximum privacy, we recommend closing the tab when you're done chatting.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
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
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default HelpInfo;
