"use client"

import { useCharacter } from "@/contexts/CharacterContext";
import { PanelRightClose, PanelLeftClose, MessageCircle, Star } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import CharacterList from "./sidebar/CharacterList";
import { NavigationIcons } from "./NavigationIcons";


export default function LayoutWrapper({ children }) {

    // States
    const [isSidebarShrinked, setIsSidebarShrinked] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [isTablet, setIsTablet] = useState(false)
    const [isDesktop, setIsDesktop] = useState(false)

    // Context
    const { selectedCharacter } = useCharacter();

    useEffect(() => {

        const width = window.innerWidth;

        if (width <= 768) {
            setIsMobile(true)
            setIsTablet(false)
            setIsDesktop(false)
        } else if (width <= 1024 && width > 768) {
            setIsMobile(false)
            setIsTablet(true)
            setIsDesktop(false)
        } else {
            setIsMobile(false)
            setIsTablet(false)
            setIsDesktop(true)
        }


    }, [])

    // Function to shrink the sidebar
    function handleSidebarShrink() {
        setIsSidebarShrinked(!isSidebarShrinked)
    }

    // Dynamic Sidebar
    const Sidebar = () => {

        if (!isSidebarShrinked && isDesktop) {
            return (
                <div className="h-screen sticky top-0 w-64 border-r border-neutral-200/50 dark:border-neutral-800/50 bg-card flex flex-col">
                    <div className="flex-none border-b border-neutral-200/50 dark:border-neutral-800/50">
                        <div className="flex flex-col items-center justify-between gap-4 p-4">
                            <div className='w-full flex justify-between items-center'>
                                <Link href="/" className="text-xl font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer p-2">
                                    CelebChat AI
                                </Link>
                                <button onClick={handleSidebarShrink} className='text-neutral-700 dark:text-neutral-200 hover:text-primary p-2 transition-colors duration-200'>
                                    <PanelLeftClose className='h-6 w-6'/>
                                </button>
                            </div>
                            <div className="flex items-center w-full">
                                <NavigationIcons />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <CharacterList />
                    </div>
                </div>
            )
        } else if (isMobile) {

            return (
                <div className="h-screen w-full border-r border-neutral-200/50 dark:border-neutral-800/50 bg-card flex flex-col">
                    <div className="flex-none border-b border-neutral-200/50 dark:border-neutral-800/50">
                        <div className="flex flex-col items-center justify-between gap-4 p-4">
                            <div className='w-full flex justify-between items-center'>
                                <Link href="/" className="text-xl font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer p-2">
                                    CelebChat AI
                                </Link>

                                <div className="relative">
                                    <MessageCircle className="h-12 w-12 text-primary/20" strokeWidth={1.5} />
                                    <MessageCircle 
                                        className="h-8 w-8 text-primary/40 absolute top-4 left-4" 
                                        strokeWidth={1.5}
                                    />
                                    <Star 
                                        className="h-4 w-4 text-primary/60 absolute -top-1 -right-1" 
                                        strokeWidth={1.5}
                                        fill="currentColor"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center w-full">
                                <NavigationIcons />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <CharacterList />
                    </div>
                </div>
            )
        } else {
            return (
                <div className="h-screen sticky top-0 w-8 border-r border-neutral-200/50 dark:border-neutral-800/50 bg-card flex flex-col">
                    <div className="flex-none border-b border-neutral-200/50 dark:border-neutral-800/50">
                        <div className="flex flex-col items-center justify-between gap-4 p-4">
                            <button onClick={handleSidebarShrink} className='text-neutral-700 dark:text-neutral-200 hover:text-primary p-2 transition-colors duration-200'>
                                <PanelRightClose className='h-6 w-6'/>
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
    }           



    // Layout rendering
    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* Sidebar always visible on desktop/tablet, conditional on mobile */}
            {isMobile ? (
            selectedCharacter ? (
                <main className="w-full h-screen overflow-y-auto">
                    {children}
                </main>
            ) : (
                <Sidebar className="w-full h-screen overflow-y-auto" />
            )
            ) : (
            <>
                <Sidebar className="h-screen overflow-y-auto" />
                <main className="flex items-center flex-1 h-screen overflow-y-auto">
                    {children}
                </main>
            </>
            )}
        </div>
    );
}
