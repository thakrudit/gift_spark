import React, { useEffect, useState } from 'react'
import { Button, ChoiceList, Layout, LegacyCard, ResourceItem, ResourceList, Select, SkeletonBodyText, SkeletonDisplayText, Text, TextContainer, TextField, Thumbnail } from '@shopify/polaris'
import { ResourcePicker as ResourcePickerAction, Redirect } from "@shopify/app-bridge/actions";
import { useNavigate } from 'react-router-dom';
import { useAppBridge } from '@shopify/app-bridge-react';
import apiHelper from '../helper/apiHelper';
import DEVELOPMENT_CONFIG from '../helper/config';
import { createApp } from '@shopify/app-bridge';
import { svgImage } from '../assets';

export default function FreeGiftGoal() {
    const shopify = useAppBridge();
    const { shop } = shopify?.config || "";
    const { config } = shopify || {};

    const app = createApp(config);

    const navigate = useNavigate();
    // Handel Back
    const handleBackToGoals = () => {
        navigate("/setGoals");
    };

    const [fields, setFields] = useState({
        title: "",
        productId: "",
        tergetType: ["mp1"],
        minRequirement: "0",
        minQuantity: "0",
        eligibility: "all",
        allItems: true,
        specificItems: [],
        message1: "",
        message2: "",
    });

    const [resources, setResources] = useState([]);
    const [search, setSearch] = useState("");

    const handleChange = (value, name) => {
        setFields(prevFields => ({
            ...prevFields,
            [name]: value
        }))
    }

    const [isLoading, setIsLoading] = useState(false);
    const setLoading = (flag) => {
        shopify.loading(flag);
        setIsLoading(flag);
    }

    const [optionGift, setOptionGift] = useState({
        _id: "",
        id: "",
        title: "",
    });

    const options = [
        {
            label: optionGift?.title,
            value: optionGift?._id,
            key: optionGift?.id,
        },
    ];

    async function getGiftProduct() {
        setLoading(true);
        let result = await apiHelper.getRequest(`/api/v1/get-free-gift?shop=${shop}`);
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            setOptionGift(result?.body);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }

    useEffect(() => {
        getGiftProduct();
    }, [])

    console.log("fields: ", fields)

    const openProductPicker = () => {
        const productWithAllVariantsSelected = resources.map((product) => ({
            id: product.id,
        }));

        const picker = ResourcePickerAction.create(app, {
            resourceType: ResourcePickerAction.ResourceType.Product,
            options: {
                showVariants: false,
                initialSelectionIds: productWithAllVariantsSelected,
            },
        });

        const handleSelection = async (payload) => {
            const selectedProducts = payload.selection;

            setResources((prevResources) => {
                const prevProductIds = prevResources.map((product) => product.id);

                const updatedResources = prevResources.filter((product) =>
                    selectedProducts.some((selected) => selected.id === product.id)
                );

                const newSelections = selectedProducts.filter(
                    (selected) => !prevProductIds.includes(selected.id)
                );

                return [...updatedResources, ...newSelections];
            });

            // setError(prev => ({ ...prev, resources: "" }))
            // setError(prev => ({ ...prev, totalInventory: "" }))

            // if (selectedProducts?.length > 0) {
            //     setTitle(`Free ${selectedProducts[0].title}`);
            //     setGiftUrl(giftImage);
            //     setError(prev => ({ ...prev, title: "" }))
            // } else {
            //     setTitle("");
            //     setGiftUrl(svgImage);
            // }

            picker.unsubscribe();
        };

        const handleCancel = () => {
            picker.unsubscribe();
        };

        picker.subscribe(ResourcePickerAction.Action.SELECT, handleSelection);
        picker.subscribe(ResourcePickerAction.Action.CANCEL, handleCancel);

        picker.dispatch(ResourcePickerAction.Action.OPEN);
    };

    const [isPopulating, setIsPopulating] = useState();
    const setPopulating = (flag, key) => {
        shopify.loading(flag);
        setIsPopulating(flag);
    };

    const handleCreateGiftGoal = async (e) => {
        e.preventDefault();
    }

    if (isLoading) {
        return (
            <Layout>
                <Layout.Section>
                    <LegacyCard sectioned>
                        <TextContainer>
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText />
                        </TextContainer>
                    </LegacyCard>

                    <LegacyCard sectioned>
                        <TextContainer>
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText />
                        </TextContainer>
                    </LegacyCard>

                    <LegacyCard sectioned>
                        <TextContainer>
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText lines={4} />
                        </TextContainer>
                    </LegacyCard>

                    <LegacyCard sectioned>
                        <TextContainer>
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText />
                        </TextContainer>
                    </LegacyCard>

                    <LegacyCard sectioned>
                        <TextContainer>
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText />
                        </TextContainer>
                    </LegacyCard>

                    <LegacyCard sectioned>
                        <TextContainer>
                            <SkeletonDisplayText size="small" />
                        </TextContainer>
                    </LegacyCard>
                </Layout.Section>
                <Layout.Section secondary></Layout.Section>
            </Layout>
        );
    }

    return (
        <Layout>
            <Layout.Section>
                <LegacyCard title="Goal Name" sectioned>
                    <TextField
                        label="Title"
                        type="text"
                        value={fields.title}
                        onChange={(value) => handleChange(value, "title")}
                    />
                </LegacyCard>
                <LegacyCard sectioned title="Goal Reward">
                    <Select
                        label="Which Gift The Customer Gets"
                        placeholder="Select Gift"
                        options={options}
                        value={fields.productId}
                        onChange={(value) => handleChange(value, "productId")}
                    />
                </LegacyCard>
                <LegacyCard sectioned title="Goal Target">
                    <ChoiceList
                        choices={[
                            {
                                label: "Cart Subtotal",
                                helpText:
                                    "Customer needs to reach a minimun subtotal to meet this goal",
                                value: "mp1",
                            },
                            {
                                label: "Cart Items Count",
                                helpText:
                                    "Customer needs to reach a minimun cart count in order to meet this goal",
                                value: "mp2",
                            },
                        ]}
                        selected={fields.tergetType}
                        onChange={(value) => handleChange(value, "tergetType")}
                    />
                    {fields.tergetType == "mp1" && (
                        <>
                            <TextField
                                label="Minimum Requirement"
                                type="number"
                                value={fields.minRequirement}
                                onChange={(value) => handleChange(value, "minRequirement")}
                                prefix="$"
                                placeholder="0"
                                autoComplete="off"
                            />
                        </>
                    )}

                    {fields.tergetType == "mp2" && (
                        <>
                            <TextField
                                label="Minimum Quantity"
                                type="number"
                                value={fields.minQuantity}
                                onChange={(value) => handleChange(value, "minQuantity")}
                                placeholder="0"
                                autoComplete="off"
                            />
                        </>
                    )}
                </LegacyCard>
                <LegacyCard sectioned title="Goal Target Applies To">
                    <ChoiceList
                        choices={[
                            { label: "All Items", value: "all" },
                            { label: "Included Items", value: "prerequisite" },
                        ]
                        }
                        selected={fields.eligibility}
                        onChange={(value) => handleChange(value, "eligibility")}
                    />
                    {fields.eligibility == "prerequisite" &&
                        <>
                            <TextField
                                type="Search"
                                value={search}
                                //   onChange={openProductPicker}
                                onFocus={openProductPicker}
                                // prefix={<Icon source={SearchIcon} tone="base" />}
                                placeholder="Search Product"
                                connectedRight={
                                    <Button variant="primary" onClick={openProductPicker}>
                                        Browse
                                    </Button>
                                }
                            />

                            {resources?.length > 0 ? (
                                <>
                                    <div className="browse-rp">
                                        <ResourceList
                                            resourceName={{ singular: "product", plural: "products" }}
                                            items={resources}
                                            renderItem={(item) => {
                                                const { id, title, vendor, images } = item;
                                                const imageUrl =
                                                    images?.[0]?.originalSrc || svgImage;
                                                return (
                                                    <ResourceItem
                                                        id={id}
                                                        accessibilityLabel={`View details for ${title}`}
                                                        media={
                                                            <Thumbnail source={imageUrl} alt="Thumbnail Image" />
                                                        }
                                                    >
                                                        <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                            {title}
                                                        </Text>
                                                        <Button
                                                            plain
                                                            // icon={<Icon source={XIcon} color="inkLightest" />}
                                                            // onClick={() => handleRemove(item.id)}
                                                            style={{ marginLeft: "auto" }}
                                                        />
                                                    </ResourceItem>
                                                );
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <></>
                            )}
                        </>
                    }
                </LegacyCard >
                <LegacyCard sectioned title="Goal Message">
                    <TextField
                        label="Message when cart is empty"
                        type='text'
                        value={fields.message1}
                        onChange={(value) => handleChange(value, "message1")}
                        autoComplete="off"
                    />
                    <TextField
                        label="Message when gift goal is met"
                        type='text'
                        value={fields.message2}
                        onChange={(value) => handleChange(value, "message2")}
                        autoComplete="off"
                    />
                </LegacyCard>
                <LegacyCard sectioned>
                    <Button onClick={handleCreateGiftGoal} loading={isPopulating}>
                        Create Gift Goal
                    </Button>
                </LegacyCard>
            </Layout.Section>
            <Layout.Section secondary></Layout.Section>
        </Layout>
    )
}
