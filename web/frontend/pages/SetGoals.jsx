import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { Button, Layout, LegacyCard } from '@shopify/polaris'

export default function SetGoals() {

    const navigate = useNavigate();
    const [isEnable, setIsEnable] = useState(false)
    console.log("isEnable:", isEnable)

    const handleNavGiftGoal = () => {
        navigate("/freeGiftGoal");
    };

    const handleToggle = async (e) => {
        // e.preventDefault();
        const newStatus = !isEnable
        setIsEnable(newStatus)
    }

    return (
        <Layout>
            <Layout.Section>
                <LegacyCard sectioned title="Free Gift Goal">
                    <div className='flex items-center justify-between'>
                        <Button onClick={handleNavGiftGoal} >
                            Create Gift Goal
                        </Button>
                        <label className="inline-block cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                disabled={false}
                                onChange={handleToggle}
                                checked={isEnable}
                            />
                            <div className="slider w-12 h-6 rounded-full transition-all duration-300 peer-checked:bg-green-500 peer-[:not(:checked)]:bg-red-500 before:content-[''] before:absolute before:top-1 before:left-1 before:bg-white before:w-4 before:h-4 before:rounded-full before:transition-transform before:duration-300 peer-checked:before:translate-x-7 relative"></div>
                        </label>
                    </div>
                </LegacyCard>
            </Layout.Section>
            <Layout.Section secondary></Layout.Section>
        </Layout>
    )
}
