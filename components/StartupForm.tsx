'use client';

import React, { useActionState, useState } from 'react'
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import MDEditor from '@uiw/react-md-editor';
import { Button } from './ui/button';
import { Send } from 'lucide-react';
import { formSchema } from '@/lib/validation';
import z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { createPitch } from '@/lib/actions';

const StartupForm = () => {

    const [errors, setErrors] =  useState<Record<string,string>>({})

    const [pitch, setPitch] = useState("");

    const {toast} = useToast();
    const router = useRouter();

    const handleFormSubmit = async(prevState: object, formData: FormData)=>{
        try{
            const formValues = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                category: formData.get('category') as string,
                link: formData.get('link') as string,
                pitch,
            }

            await formSchema.parseAsync(formValues);
            
            const result = await createPitch(prevState, formData, pitch)
            
            if(result.status == "SUCCESS"){

                toast({
                    title: "Success",
                    description: 'Your startup pitch has been created successfully',
                })

                router.push(`/startup/${result._id}`)
            }

            return result;
        }catch(error){
            console.log(error);
            if(error instanceof z.ZodError){
                const fieldErrors = error.flatten().fieldErrors;

                setErrors(fieldErrors as unknown as Record<string, string>);

                toast({
                    title: "Error",
                    description: 'Please check your inputs and try again',
                    variant: 'destructive',
                })
                
                return {...prevState, error: 'Validation failed', status: "ERROR"}
            }
            toast({
                title: "Error",
                description: 'An unexpected error has occured',
                variant: 'destructive',
            })
            return {...prevState, error: 'An unexpected error has occured', status: "ERROR"}
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [state, formAction, isPending] = useActionState(handleFormSubmit, {
        error: "",
        status: "INITIAL",
      });


  return (
    <form action={formAction} className='startup-form'>
        <div >
            <label htmlFor="title" className="startup-form_label">Title</label>
            <Input name='title' id='title' className='startup-form_input' required placeholder='Startup Title' />
            {errors.title && 
                <p className="startup-form_error">{errors.title}</p>
            }
        </div>
        <div >
            <label htmlFor="description" className="startup-form_label">Description</label>
            <Textarea name='description' id='description' className='startup-form_textarea' required placeholder='Startup Description' />
            {errors.description && 
                <p className="startup-form_error">{errors.description}</p>
            }
        </div>
        <div >
            <label htmlFor="category" className="startup-form_label">Category</label>
            <Input name='category' id='category' className='startup-form_input' required placeholder='Startup Category (Tech, Health, Education, etc.)' />
            {errors.category && 
                <p className="startup-form_error">{errors.category}</p>
            }
        </div>
        <div >
            <label htmlFor="link" className="startup-form_label">Image URL</label>
            <Input name='link' id='link' className='startup-form_input' required placeholder='Startup Image URL' />
            {errors.link && 
                <p className="startup-form_error">{errors.link}</p>
            }
        </div>
        <div data-color-mode="light">
            <label htmlFor="pitch" className="startup-form_label">Pitch</label>
            <MDEditor
                className='startup-form_editor'
                value={pitch}
                onChange={(value)=> setPitch(value as string)}
                id='pitch'
                preview='edit'
                height={300}
                style={{borderRadius: 20, overflow: 'hidden'}}
                textareaProps={{
                    placeholder:'Briefly describe your idea and what problem it solves',
                }}
                previewOptions={{disallowedElements: ['style']}}
            />
            {/* <MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} /> */}
            {errors.pitch && 
                <p className="startup-form_error">{errors.pitch}</p>
            }
        </div>

        <Button type='submit' className='startup-form_btn text-white' disabled={isPending}>
            {isPending ? "Submitting...":"Submit Your Pitch"}
            <Send className='size-6 ml-2'></Send>
        </Button>
    </form>
  )
}

export default StartupForm