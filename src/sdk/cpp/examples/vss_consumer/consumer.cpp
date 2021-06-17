/*****************************************************************************
 * Copyright (c) 2021 Bosch.IO GmbH
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 ****************************************************************************/

#include <csignal>
#include <initializer_list>
#include <memory>

#include "nlohmann/json.hpp"
#include "client.hpp"
#include "mqtt_client.hpp"

using namespace iotea::core;
using json = nlohmann::json;

static const std::string SERVER_ADDRESS("tcp://localhost:1883");
static const std::string TALENT_NAME("vss_consumer");
static const std::string PROVIDED_FEATURE_NAME("messageString");
static const std::string PROVIDED_FETAURE_TYPE(schema::DEFAULT_TYPE);


class EventConsumer : public Talent {

   public:
    EventConsumer()
        : Talent(TALENT_NAME) {

        int ttl = 1000;
        int history = 30;
        AddOutput(PROVIDED_FEATURE_NAME, schema::Metadata("Message to be forwarded to echo provider", history, ttl, "ONE",
                                                          schema::OutputEncoding(schema::OutputEncoding::Type::String)));

    }

    schema::rule_ptr OnGetRules() const override {
        std::cout << "testOnGet" << std::endl;
        return OrRules(
            Change("Acceleration$Longitudinal", "Vehicle"),
            Change("Acceleration$Vertical", "Vehicle"),
        Change("Acceleration$Lateral", "Vehicle"),
                        (Change("OBD$Speed", "Vehicle")));
    }
    void OnEvent(const Event& event, event_ctx_ptr context) override {
        GetLogger().Info() << "Event GetType: " << event.GetType();
        GetLogger().Info() << "Event GetFeature: " << event.GetFeature();
        GetLogger().Info() << "Event GetValue: " << event.GetValue()["value"].get<int>();
        if (event.GetFeature() == "Speed") {
            auto args =
                json{event.GetValue()["value"].get<int>(), json{{"factor", event.GetValue()["value"].get<int>()}, {"unit", "kmh"}}};

            //auto t = context->Call(provider_talent.Multiply, args);

            //context->Gather([](std::vector<json> replies) {
            //    GetLogger().Info() << "Multiply result: " << replies[0].dump(4);
            //}, nullptr, t);

            //auto s = context->Call(provider_talent.Fib, args, 100);

            //auto handle_result = [](std::vector<json> replies) {
            //    GetLogger().Info() << "Fibonacci result: " << replies[0].dump(4);
            //};
            //auto handle_timeout = [](){
            //    GetLogger().Info() << "******* Timed out waiting for result";
            //};

            //context->Gather(handle_result, handle_timeout, s);
        }
    }

};

static Client client = Client{SERVER_ADDRESS};

void signal_handler(int) {
    client.Stop();
}

int main(int, char**) {
    auto talent = std::make_shared<EventConsumer>();
    client.RegisterTalent(talent);

    std::signal(SIGINT, signal_handler);
    client.Start();

    return 0;
}
