import { MessageCircle, Star } from 'lucide-react'

const Logo = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <MessageCircle className="h-16 w-16 text-primary/20" strokeWidth={1.5} />
        <MessageCircle 
          className="h-12 w-12 text-primary/40 absolute top-4 left-4" 
          strokeWidth={1.5}
        />
        <Star 
          className="h-6 w-6 text-primary/60 absolute -top-1 -right-1" 
          strokeWidth={1.5}
          fill="currentColor"
        />
      </div>
      <h1 className="text-3xl font-semibold text-primary/80">CelebChat AI</h1>
      <p className="text-sm text-muted-foreground">
        Choose a character to start chatting
      </p>
    </div>
  )
}

export default Logo 