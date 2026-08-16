"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/registry/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/registry/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/registry/ui/avatar"
import { Badge } from "@/registry/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/ui/breadcrumb"
import { Button } from "@/registry/ui/button"
import { ButtonGroup } from "@/registry/ui/button-group"
import { Calendar } from "@/registry/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/ui/card"
import { Checkbox } from "@/registry/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/registry/ui/collapsible"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/ui/empty"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/ui/hover-card"
import { Input } from "@/registry/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/registry/ui/input-group"
import { Kbd } from "@/registry/ui/kbd"
import { Label } from "@/registry/ui/label"
import { NativeSelect } from "@/registry/ui/native-select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/ui/popover"
import { Progress } from "@/registry/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/registry/ui/radio-group"
import { ScrollArea } from "@/registry/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select"
import { Separator } from "@/registry/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/ui/sheet"
import { Skeleton } from "@/registry/ui/skeleton"
import { Slider } from "@/registry/ui/slider"
import { Spinner as UISpinner } from "@/registry/ui/spinner"
import { Switch } from "@/registry/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/ui/tabs"
import { Textarea } from "@/registry/ui/textarea"
import { Toggle } from "@/registry/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/registry/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/ui/tooltip"

import { AspectRatio } from "@/registry/ui/aspect-ratio"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/registry/ui/context-menu"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/ui/drawer"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/registry/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/registry/ui/input-otp"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/registry/ui/item"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/registry/ui/menubar"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/registry/ui/navigation-menu"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/registry/ui/resizable"
import { Toaster } from "@/registry/ui/sonner"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/ui/form"

import { ArrowRight, Copy, Plus, Search, Settings, Trash, User, Warning } from "./icons"

function Row({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <section
      className="mb-8 break-inside-avoid rounded-xl border p-6"
      style={{ borderColor: "var(--hairline)" }}
    >
      <div className="mb-4">
        <h3
          className="mono text-[10px] uppercase"
          style={{ letterSpacing: "0.18em", color: "var(--muted-fg)" }}
        >
          {title}
        </h3>
        {note ? (
          <p className="mt-1 text-[12px]" style={{ color: "var(--muted-fg)" }}>
            {note}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </section>
  )
}

export function ComponentsView({ displayStyle }: { displayStyle: React.CSSProperties }) {
  const [progress, setProgress] = React.useState(68)
  const form = useForm<{ name: string }>({ defaultValues: { name: "" } })

  return (
    <TooltipProvider>
      <Toaster />
      <div className="h-full [column-fill:auto] columns-[24rem] gap-8 px-8 py-8">
        <header className="mb-8 break-inside-avoid">
          <h1 className="display text-[34px]" style={displayStyle}>
            Components
          </h1>
          <p className="mt-2 max-w-[64ch] text-[14px]" style={{ color: "var(--muted-fg)" }}>
            These are the real vendored components from <code className="mono">registry/ui</code>,
            not mockups. Every one is reading swagui&rsquo;s tokens through the shadcn bridge — change
            the canvas, theme or squircle below and watch them all follow.
          </p>
        </header>

        <Row title="Button" note="variant × size, straight from registry/ui/button.tsx">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Delete</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <Plus className="size-4" />
          </Button>
          <Button>
            Continue <ArrowRight className="size-4" />
          </Button>
          <Button variant="outline">
            <UISpinner /> Loading
          </Button>
        </Row>

        <Row title="Button group">
          <ButtonGroup>
            <Button variant="outline">Day</Button>
            <Button variant="outline">Week</Button>
            <Button variant="outline">Month</Button>
          </ButtonGroup>
        </Row>

        <Row title="Badge">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Failed</Badge>
          <Badge variant="secondary">
            <span className="brand-dot mr-1 inline-block size-1.5 rounded-full" /> Building
          </Badge>
        </Row>

        <Row title="Input, textarea & label">
          <div className="w-56 space-y-1.5">
            <Label htmlFor="p">Project name</Label>
            <Input id="p" placeholder="my-project" />
          </div>
          <div className="w-56 space-y-1.5">
            <Label htmlFor="d">Disabled</Label>
            <Input id="d" placeholder="Unavailable" disabled />
          </div>
          <div className="w-56 space-y-1.5">
            <Label htmlFor="e">Invalid</Label>
            <Input id="e" aria-invalid defaultValue="not-an-email" />
          </div>
          <div className="w-72 space-y-1.5">
            <Label htmlFor="t">Description</Label>
            <Textarea id="t" defaultValue="A registry sharing one fixed identity." />
          </div>
        </Row>

        <Row title="Input group">
          <InputGroup className="w-64">
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search components…" />
          </InputGroup>
        </Row>

        <Row title="Select & native select">
          <Select>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Pick a framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next">Next.js</SelectItem>
              <SelectItem value="remix">Remix</SelectItem>
              <SelectItem value="astro">Astro</SelectItem>
            </SelectContent>
          </Select>
          <NativeSelect className="w-56">
            <option>Next.js</option>
            <option>Remix</option>
          </NativeSelect>
        </Row>

        <Row title="Checkbox, radio & switch" note="Selection reads as foreground, never brand.">
          <div className="flex items-center gap-2">
            <Checkbox id="c" defaultChecked />
            <Label htmlFor="c">Accept terms</Label>
          </div>
          <RadioGroup defaultValue="registry" className="gap-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="registry" id="r1" />
              <Label htmlFor="r1">Copy-paste registry</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="npm" id="r2" />
              <Label htmlFor="r2">npm package</Label>
            </div>
          </RadioGroup>
          <div className="flex items-center gap-2">
            <Switch id="s" defaultChecked />
            <Label htmlFor="s">Dark mode</Label>
          </div>
        </Row>

        <Row title="Toggle & toggle group">
          <Toggle>Bold</Toggle>
          <ToggleGroup type="single" defaultValue="left" variant="outline">
            <ToggleGroupItem value="left">Left</ToggleGroupItem>
            <ToggleGroupItem value="center">Center</ToggleGroupItem>
            <ToggleGroupItem value="right">Right</ToggleGroupItem>
          </ToggleGroup>
        </Row>

        <Row title="Tabs">
          <Tabs defaultValue="overview" className="w-96">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-3 text-[13px]">
              Four projects consuming the registry.
            </TabsContent>
            <TabsContent value="activity" className="pt-3 text-[13px]">
              No recent activity.
            </TabsContent>
            <TabsContent value="settings" className="pt-3 text-[13px]">
              Registry URL and theme preset.
            </TabsContent>
          </Tabs>
        </Row>

        <Row title="Progress & slider">
          <div className="w-64 space-y-2">
            <Progress value={progress} />
            <Slider
              value={[progress]}
              max={100}
              step={1}
              onValueChange={([v]) => setProgress(v)}
            />
          </div>
        </Row>

        <Row title="Card">
          <Card className="w-72">
            <CardHeader>
              <CardTitle>Team plan</CardTitle>
              <CardDescription>Unlimited registry installs.</CardDescription>
            </CardHeader>
            <CardContent className="text-[13px]">
              Radius, type and motion curves never vary across projects.
            </CardContent>
            <CardFooter>
              <Button className="w-full">Upgrade</Button>
            </CardFooter>
          </Card>
        </Row>

        <Row title="Alert">
          <Alert className="w-80">
            <Settings className="size-4" />
            <AlertTitle>Preset updated</AlertTitle>
            <AlertDescription>Existing installs will not receive this change.</AlertDescription>
          </Alert>
          <Alert variant="destructive" className="w-80">
            <Warning className="size-4" />
            <AlertTitle>Build failed</AlertTitle>
            <AlertDescription>registry.json is missing a homepage field.</AlertDescription>
          </Alert>
        </Row>

        <Row title="Avatar, tooltip & kbd">
          <div className="flex -space-x-2">
            {["RS", "LE", "GO", "JT"].map((a) => (
              <Avatar key={a} className="ring-background ring-2">
                <AvatarFallback>{a}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <Copy className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy install command</TooltipContent>
          </Tooltip>
          <span className="flex items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </Row>

        <Row title="Overlays" note="Dialog, alert dialog, sheet, popover, hover card, dropdown.">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New project</DialogTitle>
                <DialogDescription>Add a project to the registry.</DialogDescription>
              </DialogHeader>
              <div className="space-y-1.5">
                <Label htmlFor="np">Name</Label>
                <Input id="np" placeholder="my-project" />
              </div>
              <DialogFooter>
                <Button>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Alert dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete project?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes gojo from the registry and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
                <SheetDescription>Registry configuration.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="text-[13px]">
              Presets are color-only. Radius and type never vary.
            </PopoverContent>
          </Popover>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link">Hover card</Button>
            </HoverCardTrigger>
            <HoverCardContent className="text-[13px]">
              swagui — a registry that replaces shadcn/ui.
            </HoverCardContent>
          </HoverCard>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Dropdown</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Copy className="size-3.5" /> Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="size-3.5" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash className="size-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Row>

        <Row title="Command" note="cmdk — the ⌘K surface.">
          <Command className="w-80 border">
            <CommandInput placeholder="Search components…" />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup heading="Components">
                <CommandItem>
                  <Search className="size-3.5" /> Button
                </CommandItem>
                <CommandItem>
                  <Settings className="size-3.5" /> Select
                </CommandItem>
                <CommandItem>
                  <User className="size-3.5" /> Avatar
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </Row>

        <Row title="Accordion & collapsible">
          <Accordion type="single" collapsible className="w-full max-w-xl">
            <AccordionItem value="a">
              <AccordionTrigger>Does a preset update reach installed projects?</AccordionTrigger>
              <AccordionContent>
                No. Registry installs are copies — a preset change only affects new installs.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>Why is the brand colour never on a button?</AccordionTrigger>
              <AccordionContent>
                Hierarchy is carried by elevation and type, not by hue.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Collapsible className="w-full max-w-xl">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                Show token bridge
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mono pt-2 text-[12px]">
              --primary: var(--fg); --ring: color-mix(in oklch, var(--brand) 55%, transparent);
            </CollapsibleContent>
          </Collapsible>
        </Row>

        <Row title="Table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requests</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ["relays", "Live", "12,480"],
                ["leorio", "Live", "8,201"],
                ["gojo", "Building", "3,914"],
              ].map((r) => (
                <TableRow key={r[0]}>
                  <TableCell>
                    <a href="#" className="brand-link">
                      {r[0]}
                    </a>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="brand-dot inline-block size-1.5 rounded-full" />
                      {r[1]}
                    </span>
                  </TableCell>
                  <TableCell>{r[2]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Row>

        <Row title="Breadcrumb & pagination">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Registry</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Button</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Row>

        <Row title="Calendar">
          <Calendar mode="single" className="rounded-md border" />
        </Row>

        <Row title="Scroll area & separator">
          <ScrollArea className="h-32 w-64 rounded-md border p-3">
            <div className="space-y-2 text-[13px]">
              {Array.from({ length: 12 }, (_, i) => (
                <React.Fragment key={i}>
                  <div>Component {i + 1}</div>
                  <Separator />
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
        </Row>

        <Row title="Skeleton & empty">
          <div className="w-64 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Empty className="w-72 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search className="size-4" />
              </EmptyMedia>
              <EmptyTitle>No components yet</EmptyTitle>
              <EmptyDescription>Add your first item to the registry.</EmptyDescription>
            </EmptyHeader>
            <Button size="sm">Add component</Button>
          </Empty>
        </Row>

        <Row title="Field" note="The structured form primitive — label, control, description, group.">
          <FieldGroup className="w-80">
            <Field>
              <FieldLabel htmlFor="f1">Registry URL</FieldLabel>
              <Input id="f1" defaultValue="swagui.rohoswagger.com" />
              <FieldDescription>Where the CLI resolves items from.</FieldDescription>
            </Field>
            <Field orientation="horizontal">
              <Switch id="f2" defaultChecked />
              <FieldLabel htmlFor="f2">Publish publicly</FieldLabel>
            </Field>
          </FieldGroup>
        </Row>

        <Row title="Form" note="react-hook-form wiring with validation message.">
          <Form {...form}>
            <form
              className="w-80"
              onSubmit={form.handleSubmit(() => toast("Project created"))}
            >
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "A project name is required." }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project name</FormLabel>
                    <FormControl>
                      <Input placeholder="my-project" {...field} />
                    </FormControl>
                    <FormDescription>Lowercase, no spaces.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-3">
                Create
              </Button>
            </form>
          </Form>
        </Row>

        <Row title="Item" note="List row primitive — media, content, actions.">
          <div className="w-96">
            <Item variant="outline">
              <ItemMedia>
                <Avatar>
                  <AvatarFallback>RS</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>relays</ItemTitle>
                <ItemDescription>12,480 requests this month</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="ghost" size="icon">
                  <Settings className="size-4" />
                </Button>
              </ItemActions>
            </Item>
          </div>
        </Row>

        <Row title="Input OTP">
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </Row>

        <Row title="Menubar & navigation menu">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  New project <MenubarShortcut>⌘N</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem variant="destructive">Delete</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>View</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Toggle theme</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-64 gap-1 p-2 text-[13px]">
                    <NavigationMenuLink href="#">Button</NavigationMenuLink>
                    <NavigationMenuLink href="#">Select</NavigationMenuLink>
                    <NavigationMenuLink href="#">Dialog</NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </Row>

        <Row title="Context menu" note="Right-click the target.">
          <ContextMenu>
            <ContextMenuTrigger className="flex h-20 w-64 items-center justify-center rounded-md border border-dashed text-[13px]">
              Right-click here
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>
                <Copy className="size-3.5" /> Copy
                <ContextMenuShortcut>⌘C</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem variant="destructive">
                <Trash className="size-3.5" /> Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </Row>

        <Row title="Drawer & toast">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Open drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Theme preset</DrawerTitle>
                <DrawerDescription>Presets are colour-only.</DrawerDescription>
              </DrawerHeader>
            </DrawerContent>
          </Drawer>
          <Button
            variant="outline"
            onClick={() =>
              toast("Registry rebuilt", { description: "56 items written to public/r." })
            }
          >
            Show toast
          </Button>
        </Row>

        <Row title="Resizable & aspect ratio">
          <ResizablePanelGroup className="h-32 w-80 rounded-md border">
            <ResizablePanel defaultSize={50}>
              <div className="flex h-full items-center justify-center text-[13px]">Sidebar</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="flex h-full items-center justify-center text-[13px]">Content</div>
            </ResizablePanel>
          </ResizablePanelGroup>

          <div className="w-64">
            <AspectRatio
              ratio={16 / 9}
              className="bg-muted flex items-center justify-center rounded-md"
            >
              <span className="mono text-[11px]" style={{ color: "var(--muted-fg)" }}>
                16 / 9
              </span>
            </AspectRatio>
          </div>
        </Row>

        <Row title="Typography scale" note="Not a component — swagui's own type ramp.">
          <div className="w-full">
            <p className="display text-[56px] leading-[1.05]" style={displayStyle}>
              Display 56
            </p>
            <p className="display text-[34px] leading-[1.1]" style={displayStyle}>
              Heading 34
            </p>
            <p className="display text-[22px] leading-[1.2]" style={displayStyle}>
              Subhead 22
            </p>
            <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.65]">
              Body 15 — the workhorse size. Long enough to judge rhythm,
              measure and colour against the canvas.
            </p>
            <p className="mt-2 text-[13px]" style={{ color: "var(--muted-fg)" }}>
              Muted 13 — secondary copy, table cells, helper text.
            </p>
            <p
              className="mono mt-3 text-[11px] uppercase"
              style={{ letterSpacing: "0.24em", color: "var(--muted-fg)" }}
            >
              Mono eyebrow 11
            </p>
          </div>
        </Row>
      </div>
    </TooltipProvider>
  )
}
