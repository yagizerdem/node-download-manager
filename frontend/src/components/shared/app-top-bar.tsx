import { MoonIcon, SunIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import { useTheme } from "@/provider/theme-provider";
import { useRef } from "react";
import gsap from "gsap";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@components/ui/tooltip";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "tr", name: "Türkçe" },
];

export default function AppTopBar() {
  const theme = useTheme();
  const iconWrapperRef = useRef<HTMLDivElement>(null);

  function toggleTheme() {
    gsap
      .fromTo(
        iconWrapperRef.current,
        {
          duration: 0.5,
          rotation: 0,
        },
        {
          duration: 0.5,
          rotation: 180,
        },
      )
      .then(() => {});
    theme.setTheme(theme.theme === "light" ? "dark" : "light");
  }

  return (
    <div
      className="flex items-center justify-between gap-1 pr-10  
    justify-end w-full h-10 px-4 bg-stitch-surface-container-low text-primary rounded-b-lg select-none"
    >
      <div className="flex items-center space-x-4 w-20 select-none">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline">Open</Button>}
          />
          <DropdownMenuContent className="w-40" align="start">
            <Label className="px-2 py-1 text-sm font-semibold text-gray-500">
              Select Language
            </Label>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {LANGUAGES.map((language) => (
                <DropdownMenuItem
                  key={language.code}
                  className="cursor-pointer"
                >
                  {language.code.toUpperCase()} | {language.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center space-x-4 select-none ">
        <Tooltip>
          <TooltipTrigger
            render={
              <div ref={iconWrapperRef} className="text-primary">
                {theme.theme === "dark" ? (
                  <SunIcon onClick={toggleTheme} className="cursor-pointer" />
                ) : (
                  <MoonIcon onClick={toggleTheme} className="cursor-pointer" />
                )}
              </div>
            }
          />
          <TooltipContent>Toggle Theme</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
