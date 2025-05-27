

interface NewContactProps {
    isShow: boolean;
}

const NewContact = ({isShow}: NewContactProps) => {

    if (!isShow) return null;

    return ( 
        // Tạo một thẻ dev 
        <div className="">
            New Contact
        </div>
     );
}
 
export default NewContact;