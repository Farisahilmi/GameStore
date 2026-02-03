import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Skeleton = ({ className }) => {
  const { theme } = useTheme();
  const isLight = theme.name === 'Clean Light';
  
  return (
    <div className={`relative overflow-hidden rounded ${isLight ? 'bg-gray-200' : 'bg-white/5'} ${className}`}>
        <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shadow-2xl"
        />
    </div>
  );
};

export const GameCardSkeleton = () => {
    const { theme } = useTheme();
    return (
        <div className={`${theme.colors.card} rounded-[2.5rem] overflow-hidden border ${theme.colors.border} h-full flex flex-col ${theme.colors.shadow}`}>
            <Skeleton className="h-52 sm:h-60 w-full rounded-none" />
            <div className="p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-10" />
                </div>
                <div className="flex gap-2 mb-8">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                </div>
                <div className="mt-auto">
                    <div className="flex justify-between items-end mb-6">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-14 flex-1 rounded-2xl" />
                        <Skeleton className="h-14 flex-1 rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const HeroSkeleton = () => {
    const { theme } = useTheme();
    return (
        <div className={`h-[600px] md:h-[700px] mb-16 rounded-[3rem] mx-auto max-w-[96%] mt-8 border ${theme.colors.border} ${theme.colors.card} flex items-center overflow-hidden relative ${theme.colors.shadow}`}>
            <div className="container mx-auto px-8 md:px-20 relative z-10 flex flex-col justify-center h-full max-w-6xl mr-auto ml-0 items-start">
                <Skeleton className="h-10 w-48 rounded-full mb-10" />
                <Skeleton className="h-32 w-full max-w-3xl mb-10" />
                <Skeleton className="h-6 w-full max-w-lg mb-3" />
                <Skeleton className="h-6 w-3/4 max-w-lg mb-14" />
                <div className="flex gap-6">
                    <Skeleton className="h-16 w-48 rounded-2xl" />
                    <Skeleton className="h-16 w-48 rounded-2xl" />
                </div>
            </div>
        </div>
    );
};

export default Skeleton;
