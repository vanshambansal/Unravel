'use client';
import { motion } from 'motion/react';
import { MaterialLight } from './WorkspaceMotion';

export function ResourceSurface({ children, hasIcon }: { children: React.ReactNode; hasIcon: boolean }) {
  return <div className="ui-resource-row" data-has-icon={hasIcon}><MaterialLight />{children}</div>;
}

export function FeedbackTransition({ children, identity }: { children: React.ReactNode; identity: string }) {
  return <motion.div key={identity} initial={{ opacity:.5, y:3 }} animate={{ opacity:1, y:0 }} transition={{ duration:.16 }}>{children}</motion.div>;
}
