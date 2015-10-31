import React from 'react'
import PostAttachment from './post-attachment'

export default (props) => {
  const attachments = props.attachments || []

  const imageAttachments = attachments
    .filter(attachment => attachment.mediaType === 'image')
    .map(attachment => (<PostAttachment key={attachment.id} {...attachment}/>))

  return (
    <div className='attachments'>
      <div className='image-attachments'>
        {imageAttachments}
      </div>
    </div>
  )
}
