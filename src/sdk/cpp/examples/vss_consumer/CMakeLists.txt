add_executable(vss_consumer
    consumer.cpp
)

target_include_directories(vss_consumer PRIVATE "${CMAKE_SOURCE_DIR}/include")
target_link_libraries(vss_consumer PUBLIC iotea_sdk_cpp)
